// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./interfaces/IBEP20.sol";
import "./interfaces/IBStablePool.sol";
import "./interfaces/IBSTMinter.sol";
import "./interfaces/IBSTToken.sol";
import "./lib/SafeBEP20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Implement liquitidy farming.
contract LiquidityFarmingProxy is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;
    struct UserInfo {
        uint256 amount; /// @dev How many LP tokens the user has provided.
        uint256 rewardDebt; /// @dev Reward debt. See explanation below.
    }
    /// @notice Info of each pool.
    struct PoolInfo {
        IBEP20 lpToken; /// @dev Address of LP token contract.
        uint256 allocPoint; /// @dev How many allocation points assigned to this pool. BSTs to distribute per block.
        uint256 lastRewardBlock; /// @dev Last block number that BSTs distribution occurs.
        uint256 accTokenPerShare; /// @dev Accumulated BSTs per share, times 1e12. See below.
    }
    IBSTToken public token;
    /// @notice Info of each pool.
    PoolInfo[] public poolInfo;
    /// @notice Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    /// @notice Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    /// @notice For mint BST
    IBSTMinter public bstMinter;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event SetMinter(address _minter);
    event AddPool(address _poolAddress, uint256 _allocPoint);
    event SetPool(uint256 _pid, uint256 _allocPoint);
    event UpdatePool(
        uint256 _pid,
        uint256 accTokenPerShare,
        uint256 _tokenReward
    );
    event CalculatePending(
        uint256 _pid,
        uint256 _amount,
        uint256 rewardDebt,
        uint256 accTokenPerShare
    );
    event SetToken(address _token);

    constructor(address ownerAddress) public {
        require(
            ownerAddress != address(0),
            "LiquidityFarmingProxy: no 0 address"
        );
        transferOwnership(ownerAddress);
    }

    function setMinter(IBSTMinter _minter) public onlyOwner {
        require(
            address(_minter) != address(0),
            "LiquidityFarmingProxy: no 0 address"
        );
        bstMinter = _minter;
        emit SetMinter(address(_minter));
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /// @notice Add a new lp to the pool. Can only be called by the owner.
    function add(
        uint256 _allocPoint,
        IBEP20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        require(
            address(_lpToken) != address(0),
            "LiquidityFarmingProxy: no 0 address"
        );
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock =
            block.number > bstMinter.getStartBlock()
                ? block.number
                : bstMinter.getStartBlock();
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accTokenPerShare: 0
            })
        );
        emit AddPool(address(_lpToken), _allocPoint);
    }

    /// @notice Update the given pool's BST allocation point. Can only be called by the owner.
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
        emit SetPool(_pid, _allocPoint);
    }

    /// @notice View function to see pending BSTs on frontend.
    function pendingReward(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accTokenPerShare = pool.accTokenPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 tokenReward =
                bstMinter.getReward(address(this)).mul(pool.allocPoint).div(
                    totalAllocPoint
                ); // 0 is lp farming
            uint256 nAccTokenPerShare =
                tokenReward == 0
                    ? accTokenPerShare
                    : tokenReward.mul(1e12).div(lpSupply);
            accTokenPerShare = accTokenPerShare.add(nAccTokenPerShare);
        } else {
            accTokenPerShare = accTokenPerShare.add(accTokenPerShare);
        }
        return user.amount.mul(accTokenPerShare).div(1e12).sub(user.rewardDebt);
    }

    /// @notice Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    /// @notice Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 tokenReward =
            bstMinter.mint(pool.allocPoint, totalAllocPoint);
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        pool.accTokenPerShare = pool.accTokenPerShare.add(
            tokenReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
        emit UpdatePool(_pid, pool.accTokenPerShare, tokenReward);
    }

    /// @notice Deposit LP tokens to BStableProxyV2 for BST allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending =
                user.amount.mul(pool.accTokenPerShare).div(1e12).sub(
                    user.rewardDebt
                );
            emit CalculatePending(
                _pid,
                user.amount,
                user.rewardDebt,
                pool.accTokenPerShare
            );
            safeTokenTransfer(msg.sender, pending);
        }
        pool.lpToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accTokenPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    /// @notice Withdraw LP tokens .
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 pending =
            user.amount.mul(pool.accTokenPerShare).div(1e12).sub(
                user.rewardDebt
            );
        emit CalculatePending(
            _pid,
            user.amount,
            user.rewardDebt,
            pool.accTokenPerShare
        );
        safeTokenTransfer(msg.sender, pending);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accTokenPerShare).div(1e12);
        pool.lpToken.safeTransfer(address(msg.sender), _amount);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    /// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    /// @notice Safe token transfer function, just in case if rounding error causes pool to not have enough BSTs.
    function safeTokenTransfer(address _to, uint256 _amount) internal {
        require(_to != address(0), "LiquidityFarmingProxy: no 0 address");
        uint256 tokenBal = token.balanceOf(address(this));
        if (_amount > tokenBal) {
            token.transfer(_to, tokenBal);
        } else {
            token.transfer(_to, _amount);
        }
    }

    function setToken(IBSTToken _token) external onlyOwner {
        require(
            address(_token) != address(0),
            "LiquidityFarmingProxy: no 0 address"
        );
        token = _token;
        emit SetToken(address(_token));
    }

    function getTokenAddress() external view returns (address) {
        return address(token);
    }
}
