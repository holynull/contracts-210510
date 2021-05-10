pragma solidity ^0.6.0;
import "../interfaces/IBEP20.sol";

interface IBSTToken is IBEP20 {
    function mint(address to, uint256 amount) external;

    function transferMinterTo(address _minter) external;

}
