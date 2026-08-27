// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VesselNFT} from "../VesselNFT.sol";

contract VesselNFTTestHarness is VesselNFT {
    uint256 private immutable _testMaxSupply;

    constructor(
        address initialOwner,
        uint256 initialMintPrice,
        uint256 initialMaxPerTx,
        uint256 initialMaxPerWallet,
        string memory initialSealedURI,
        uint256 testMaxSupply
    ) VesselNFT(
        initialOwner,
        initialMintPrice,
        initialMaxPerTx,
        initialMaxPerWallet,
        initialSealedURI
    ) {
        require(testMaxSupply > 0, "test supply zero");
        _testMaxSupply = testMaxSupply;
    }

    function _maxSupply() internal view override returns (uint256) {
        return _testMaxSupply;
    }
}
