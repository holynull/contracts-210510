pragma solidity ^0.6.0;

import "../BEP20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// for test, we create stable coin for ourself.
contract TokenUSDC is BEP20, Ownable {
    using SafeMath for uint256;

    constructor() public BEP20("USDC for test", "USDC") {
        transferOwnership(msg.sender);
        _mint(msg.sender, 1_000_000_000_000_000_000_000_000_000);
    }

    function claimCoins() public {
        _mint(msg.sender, 1_000_000_000_000_000_000_000);
    }
}
