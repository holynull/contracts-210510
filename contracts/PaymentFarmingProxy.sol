// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./interfaces/IBEP20.sol";
import "./interfaces/IBSTMinter.sol";
import "./interfaces/IBStablePool.sol";
import "./interfaces/IBSTToken.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BEP20.sol";
import "./lib/TransferHelper.sol";

/// @title Implement Payment and payment farming.
contract PaymentFarmingProxy is BEP20, Ownable {
    using SafeMath for uint256;

    IBStablePool public pool;

    uint256 public paymentFee = 3_000_000_000_000_000;

    IBSTMinter bstMinter;

    address public devAddress;

    struct UserInfo {
        uint256 quantity; // user's volume
        uint256 blockNumber; // Last transaction block
    }

    mapping(address => UserInfo) public userInfo;

    uint256 public totalQuantity;

    IBSTToken token;

    struct CoinInfo {
        uint256 index;
        bool available;
    }
    mapping(address => CoinInfo) public coins;

    event Pay(
        address payToken,
        address receiptToken,
        address payer,
        address recipt
    );

    constructor(
        string memory _name,
        string memory _symbol,
        address _owner,
        address _dev
    ) public BEP20(_name, _symbol) {
        transferOwnership(_owner);
        devAddress = _dev;
    }

    function setPaymentFee(uint256 _fee) public onlyOwner {
        paymentFee = _fee;
    }

    function setMinter(IBSTMinter _minter) public onlyOwner {
        bstMinter = _minter;
    }

    function setDev(address _dev) public onlyOwner {
        devAddress = _dev;
    }

    function setToken(IBSTToken _token) public onlyOwner {
        token = _token;
    }

    /// @notice Add coins supported.
    function addCoins(address _coin, uint32 index) public onlyOwner {
        require(!coins[_coin].available, "Payment: coins dumplicated.");
        coins[_coin] = CoinInfo({index: index, available: true});
    }

    /// @notice Remove coins from supported.
    function removeCoins(address _coin) public onlyOwner {
        require(coins[_coin].available == true, "Payment: coin no exists.");
        coins[_coin].available = false;
    }

    function setPool(IBStablePool _pool) public onlyOwner {
        pool = _pool;
    }

    /// @notice Only pay, no need swap.
    function pay(
        address receiptToken,
        address receipt,
        uint256 amt
    ) external {
        require(
            amt <= IBEP20(receiptToken).balanceOf(msg.sender),
            "Payment: insufficient balance."
        );
        bstMinter.mint(address(this), 1, 1);
        uint256 fee = amt.mul(paymentFee).div(10**18);
        TransferHelper.safeTransferFrom(
            receiptToken,
            msg.sender,
            devAddress,
            fee
        );
        TransferHelper.safeTransferFrom(
            receiptToken,
            msg.sender,
            receipt,
            amt.sub(fee)
        );
        UserInfo storage user = userInfo[msg.sender];
        user.quantity = user.quantity.add(amt.sub(fee));
        userInfo[msg.sender].blockNumber = block.number;
        totalQuantity = totalQuantity.add(user.quantity);
        emit Pay(receiptToken, receiptToken, msg.sender, receipt);
    }

    /// @notice Pay, and use swap.
    function payWithSwap(
        address payToken,
        address receiptToken,
        uint256 payAmt,
        uint256 receiptAmt,
        address receipt
    ) external {
        require(payToken != receiptToken, "Payment: the same token.");
        bstMinter.mint(address(this), 1, 1);
        uint256 i = coins[payToken].index;
        uint256 j = coins[receiptToken].index;
        TransferHelper.safeTransferFrom(
            payToken,
            msg.sender,
            address(this),
            payAmt
        );
        TransferHelper.safeApprove(payToken, address(pool), payAmt);
        uint256 _originalBalance =
            IBEP20(receiptToken).balanceOf(address(this));
        pool.exchange(i, j, payAmt, receiptAmt);
        uint256 returnAmt =
            IBEP20(receiptToken).balanceOf(address(this)).sub(_originalBalance);
        require(returnAmt >= receiptAmt, "Payment: swap amt insufficient.");
        TransferHelper.safeTransfer(receiptToken, receipt, receiptAmt);
        TransferHelper.safeTransfer(
            receiptToken,
            msg.sender,
            returnAmt.sub(receiptAmt)
        );
        UserInfo storage user = userInfo[msg.sender];
        user.quantity = user.quantity.add(receiptAmt);
        userInfo[msg.sender].blockNumber = block.number;
        totalQuantity = totalQuantity.add(receiptAmt);
        emit Pay(payToken, receiptToken, msg.sender, receipt);
    }

    /// @notice The user withdraws all the payment rewards
    function withdrawReward() public {
        UserInfo storage user = userInfo[msg.sender];
        uint256 _quantity = user.quantity;
        require(user.quantity > 0, "Payment: no payment quantity.");
        bstMinter.mint(address(this), 1, 1);
        uint256 userReward =
            token.balanceOf(address(this)).mul(_quantity).div(totalQuantity);
        user.quantity = 0;
        user.blockNumber = block.number;
        TransferHelper.safeTransfer(address(token), msg.sender, userReward);
        totalQuantity = totalQuantity.sub(_quantity);
    }

    /// @notice Get rewards from users in the current pool
    function getUserReward() public view returns (uint256) {
        UserInfo storage user = userInfo[msg.sender];
        uint256 _quantity = user.quantity;
        require(user.quantity > 0, "Payment: no payment quantity.");
        uint256 userReward =
            token.balanceOf(address(this)).mul(_quantity).div(totalQuantity);
        return userReward;
    }
}
