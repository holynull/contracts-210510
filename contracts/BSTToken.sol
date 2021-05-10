// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./BEP20Burnable.sol";
import "./DelegateBEP20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BSTToken with Governance.
contract BSTToken is DelegateBEP20, Ownable {
    address public minter;

    uint256 public TOKENS_PER_INVESTOR = 1_000_000 ether;

    constructor(
        address owner,
        address minter_,
        address[] memory investors
    ) public BEP20("BStable Token", "BST") {
        require(investors.length == 10, "only have 10 investor address");
        transferOwnership(owner);
        minter = minter_;
        for (uint256 i = 0; i < 10; i++) {
            _mint(investors[i], TOKENS_PER_INVESTOR);
        }
    }

    /// @notice Creates `_amount` token to `_to`. Must only be called by the owner .
    function mint(address _to, uint256 _amount) public {
        require(msg.sender == minter, "BSTToken:only minter.");
        _mint(_to, _amount);
    }

    function transferMinterTo(address to) public onlyOwner {
        minter = to;
    }
}
