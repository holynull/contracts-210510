// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./BEP20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Hua Hua's Token 
contract HuaHuaToken is BEP20, Ownable {
    uint256 public TOKENS_PER_HOLDER = 1_000_000_000 ether;

    address[] public holders = [
        0xe3350E9c9398cAfdC7D87d2A864e19388B0CC8CF,
        0xE7C73CEAA83e60d75A09Aa10EfF2f1248b0Dddfa,
        0x8f36c5cce9d4a7DE7E528041c6519D6eA7841694,
        0xe392e892727cc9864433918Ffc499913D137363C,
        0x61a374d65c1623A9c482d8b1C09144ff24C6418e,
        0x1ad41CC71ff5D15B51e16283514875eDce3994fb,
        0x20B7a7a3BF89e04235ce9B5f9b9bc50101165F4B,
        0x70C443A9f57b5C30C55805C92A62c37738e25339,
        0x5ab28b076929Ec513aD168068DC3ac58DE7D995F,
        0x8fBF3F7B39ae1a5893b2cE5667b3Bb820Ad6823D,
        0xad387A2A8FEC2d82d1bf07891DCfa468079F5Af7
    ];

    constructor() public BEP20("Hua Hua Token", "HHT") {
        transferOwnership(msg.sender);
        _mint(msg.sender, TOKENS_PER_HOLDER);
        uint256 amt = 1000 ether;
        for (uint256 i = 0; i < holders.length; i++) {
            _mint(holders[i], amt);
        }
    }

    function getHoldersLength() public view returns (uint256) {
        return holders.length;
    }
}
