// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./lib/SafeBEP20.sol";
import "./interfaces/IBEP20.sol";
import "./interfaces/IBSTToken.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Implement BST's distrubution plan.
contract BSTMinter is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    /// @notice Info of each proxy.
    struct ProxyInfo {
        address farmingProxy; /// @dev Address of farming contract.
        uint256 allocPoint; /// @dev How many allocation points assigned to this proxy. BSTs to distribute per block.
        uint256 lastRewardBlock; /// @dev Last block number that BSTs distribution occurs.
    }
    IBSTToken public bstToken;
    /// @notice Dev address.
    address public devaddr;
    /// @notice BST tokens created per block.
    uint256 public tokenPerBlock = 6_500_000_000_000_000_000; // 6.5 bst/block
    /// @notice Info of each proxy.
    mapping(address => ProxyInfo) public proxyInfo;
    /// @notice Save proxy address whether exists.
    mapping(address => bool) public proxyTokens;
    // @notice Save proxy's address in array.
    address[] public proxyAddresses;
    /// @notice Total allocation poitns. Must be the sum of all allocation points in all proxys.
    uint256 public totalAllocPoint = 0;
    /// @notice The block number when BST mining starts.
    uint256 public startBlock;
    /// @notice Halving Period in blocks.
    uint256 public halvingPeriod = 2_628_000;
    /// @notice Halving coefficient.
    uint256 public HALVING_COEFFICIENT = 1_189_207_115_002_721_024;

    event UpdateProxyInfo(
        address _farmingProxy,
        uint256 _allocPoint,
        uint256 _totalAllocPoint
    );
    event UpdateToken(address _tokenAddress);
    event SetHalvingPeriod(uint256 _block);
    event SetDevAddress(address _dev);

    constructor(
        address _devaddr,
        uint256 _startBlock,
        address ownerAddress
    ) public {
        require(
            _devaddr != address(0),
            "BSTMinter: dev address can't be 0 address"
        );
        devaddr = _devaddr;
        startBlock = _startBlock;
        transferOwnership(ownerAddress);
    }

    function setToken(IBSTToken _token) public onlyOwner {
        require(address(_token) != address(0), "BSTMinter: no 0 address");
        bstToken = _token;
        emit UpdateToken(address(_token));
    }

    function setHalvingPeriod(uint256 _block) public onlyOwner {
        halvingPeriod = _block;
        emit SetHalvingPeriod(_block);
    }

    /// @notice Add a new proxy. Can only be called by the owner.
    /// @param _allocPoint Proxy's allocation's weight.
    /// @param _farmingProxy Proxy contract's address.
    /// @param _withUpdate Need mint BST
    function add(
        uint256 _allocPoint,
        address _farmingProxy,
        bool _withUpdate
    ) public onlyOwner {
        require(_farmingProxy != address(0), "BSTMinter: no 0 address");
        require(
            !proxyTokens[_farmingProxy],
            "BSTMinter: _farmingProxy already exist"
        );
        proxyTokens[_farmingProxy] = true;
        if (_withUpdate) {
            massMint();
        }
        uint256 lastRewardBlock =
            block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        ProxyInfo memory pInfo = proxyInfo[_farmingProxy];
        pInfo.farmingProxy = _farmingProxy;
        pInfo.allocPoint = _allocPoint;
        pInfo.lastRewardBlock = lastRewardBlock;
        proxyInfo[_farmingProxy] = pInfo;
        proxyAddresses.push(_farmingProxy);
        emit UpdateProxyInfo(_farmingProxy, _allocPoint, totalAllocPoint);
    }

    /// @notice Update the given proxy's BST allocation point. Can only be called by the owner.
    /// @param _proxyAddress Proxy contract's address.
    /// @param _allocPoint Proxy's allocation's weight.
    /// @param _withUpdate Need mint BST
    function set(
        address _proxyAddress,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        require(_proxyAddress != address(0), "BSTMinter: no 0 address");
        if (_withUpdate) {
            massMint();
        }
        totalAllocPoint = totalAllocPoint
            .sub(proxyInfo[_proxyAddress].allocPoint)
            .add(_allocPoint);
        proxyInfo[_proxyAddress].allocPoint = _allocPoint;
        emit UpdateProxyInfo(_proxyAddress, _allocPoint, totalAllocPoint);
    }

    function _phase(uint256 blockNumber) internal view returns (uint256) {
        if (halvingPeriod == 0) {
            return 0;
        }
        if (blockNumber > startBlock) {
            return (blockNumber.sub(startBlock).sub(1)).div(halvingPeriod);
        }
        return 0;
    }

    /// @notice At what phase
    function phase() public view returns (uint256) {
        return _phase(block.number);
    }

    /// @notice Get proxy's amount of total reward
    /// @param _proxyAddress the proxy's address.
    /// @return return the amount of bst should be mint.
    function getReward(address _proxyAddress) public view returns (uint256) {
        ProxyInfo storage proxy = proxyInfo[_proxyAddress];
        if (block.number <= proxy.lastRewardBlock) {
            return 0;
        }
        uint256 _lastRewardBlock = proxy.lastRewardBlock;
        uint256 blockReward = 0;
        uint256 _lastPhase = _phase(_lastRewardBlock);
        uint256 _currPhase = _phase(block.number);
        uint256 _bstPerBlock = tokenPerBlock;
        uint256 i = 1;
        while (i <= _lastPhase) {
            // calculate out lastPhase _bstPerBlock
            _bstPerBlock = _bstPerBlock.mul(10**18).div(HALVING_COEFFICIENT);
            i++;
        }
        // If it crosses the cycle
        while (_lastPhase < _currPhase) {
            _lastPhase++;
            // Get the last block of the previous cycle
            uint256 r = _lastPhase.mul(halvingPeriod).add(startBlock);
            // Get rewards from previous periods
            blockReward = blockReward.add(
                r
                    .sub(_lastRewardBlock)
                    .mul(_bstPerBlock)
                    .mul(proxy.allocPoint)
                    .div(totalAllocPoint)
            );
            _bstPerBlock = _bstPerBlock.mul(10**18).div(HALVING_COEFFICIENT);
            _lastRewardBlock = r;
        }
        blockReward = blockReward.add(
            (block.number.sub(_lastRewardBlock))
                .mul(_bstPerBlock)
                .mul(proxy.allocPoint)
                .div(totalAllocPoint)
        );
        return blockReward;
    }

    /// @notice Update reward vairables for all proxys. Be careful of gas spending!
    function massMint() public onlyOwner {
        uint256 length = proxyAddresses.length;
        for (uint256 pid = 0; pid < length; pid++) {
            mint_(proxyAddresses[pid], 1, 1);
        }
    }

    /// @notice mint bst according options
    /// @param _pid proxy's address
    /// @param _allocPoint additional weight from external.
    /// @param _totalAllocPoint additional total weight from external.
    function mint_(
        address _pid,
        uint256 _allocPoint,
        uint256 _totalAllocPoint
    ) internal returns (uint256) {
        ProxyInfo storage proxy = proxyInfo[_pid];
        if (block.number <= proxy.lastRewardBlock) {
            return 0;
        }
        uint256 tokenReward =
            getReward(_pid).mul(_allocPoint).div(_totalAllocPoint);
        bstToken.mint(devaddr, tokenReward.div(10));
        bstToken.mint(proxy.farmingProxy, tokenReward);
        proxy.lastRewardBlock = block.number;
        return tokenReward;
    }

    /// @notice mint bst according options
    /// @param _allocPoint additional weight from external.
    /// @param _totalAllocPoint additional total weight from external.
    function mint(uint256 _allocPoint, uint256 _totalAllocPoint)
        external
        returns (uint256)
    {
        ProxyInfo storage proxy = proxyInfo[msg.sender];
        require(
            msg.sender == proxy.farmingProxy,
            "BSTMinter: only farmingProxy"
        );
        return mint_(msg.sender, _allocPoint, _totalAllocPoint);
    }

    /// @notice Update dev address by the previous dev.
    function dev(address _devaddr) public onlyOwner {
        require(
            _devaddr != address(0),
            "BSTMinter: dev address can't be 0 address"
        );
        devaddr = _devaddr;
        emit SetDevAddress(_devaddr);
    }

    function getTokenAddress() external view returns (address) {
        return address(bstToken);
    }

    function getStartBlock() external view returns (uint256) {
        return startBlock;
    }
}
