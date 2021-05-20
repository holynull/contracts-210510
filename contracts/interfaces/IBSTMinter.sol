// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../lib/SafeBEP20.sol";
import "../interfaces/IBEP20.sol";
import "../interfaces/IBSTToken.sol";

interface IBSTMinter {
    function setToken(IBSTToken _token) external;

    function setHalvingPeriod(uint256 _block) external;

    function add(
        uint256 _allocPoint,
        address _farmingProxy,
        bool _withUpdate
    ) external;

    function set(
        address _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) external;

    function phase(uint256 blockNumber) external view returns (uint256);

    function phase() external view returns (uint256);

    function getReward(address _pid) external view returns (uint256);

    function massMint() external;

    function mint(
        uint256 _allocPoint,
        uint256 _totalPoints
    ) external returns (uint256);

    function dev(address _devaddr) external;

    function getTokenAddress() external view returns (address);

    function getStartBlock() external view returns (uint256);
}
