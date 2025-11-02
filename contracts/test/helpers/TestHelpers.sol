// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ITable} from "../../src/interfaces/ITable.sol";

/**
 * @title TestHelpers
 * @notice Helper functions and fixtures for testing
 */
library TestHelpers {
    /**
     * @notice Create standard table rules
     */
    function createStandardRules() internal pure returns (ITable.Rules memory) {
        return ITable.Rules({
            decks: 7,
            penetrationBps: 6700,
            hitSoft17: true,
            bjPayoutBps: 14000,
            allowDAS: true,
            allowSurrender: false,
            splitAcesOnce: true,
            midShoeEntry: false
        });
    }

    /**
     * @notice Create premier table rules
     */
    function createPremierRules() internal pure returns (ITable.Rules memory) {
        return ITable.Rules({
            decks: 7,
            penetrationBps: 6700,
            hitSoft17: true,
            bjPayoutBps: 15000,
            allowDAS: true,
            allowSurrender: false,
            splitAcesOnce: true,
            midShoeEntry: false
        });
    }

    /**
     * @notice Create custom table rules
     */
    function createCustomRules(
        uint8 decks,
        uint16 penetrationBps,
        bool hitSoft17,
        uint16 bjPayoutBps,
        bool allowDAS,
        bool allowSurrender,
        bool splitAcesOnce,
        bool midShoeEntry
    ) internal pure returns (ITable.Rules memory) {
        return ITable.Rules({
            decks: decks,
            penetrationBps: penetrationBps,
            hitSoft17: hitSoft17,
            bjPayoutBps: bjPayoutBps,
            allowDAS: allowDAS,
            allowSurrender: allowSurrender,
            splitAcesOnce: splitAcesOnce,
            midShoeEntry: midShoeEntry
        });
    }

    /**
     * @notice Calculate expected reshuffle threshold
     */
    function calculateReshuffleAt(uint8 decks, uint16 penetrationBps) internal pure returns (uint256) {
        return uint256(decks) * 52 * uint256(penetrationBps) / 10000;
    }

    /**
     * @notice Calculate minimum bet from anchor
     */
    function calculateMinBet(uint256 anchor, uint256 spreadNum, uint256 tableMin) internal pure returns (uint256) {
        uint256 minV = anchor / spreadNum;
        return minV < tableMin ? tableMin : minV;
    }

    /**
     * @notice Calculate maximum bet from anchor
     */
    function calculateMaxBet(uint256 anchor, uint256 spreadNum, uint256 tableMax) internal pure returns (uint256) {
        uint256 maxV = anchor * spreadNum;
        return maxV > tableMax ? tableMax : maxV;
    }

    /**
     * @notice Calculate growth cap
     */
    function calculateGrowthCap(uint256 lastBet, uint256 growthCapBps) internal pure returns (uint256) {
        return lastBet * (10000 + growthCapBps) / 10000;
    }

    /**
     * @notice Round to nearest step
     */
    function roundToStep(uint256 amount, uint256 step) internal pure returns (uint256) {
        if (step == 0) return amount;
        return (amount / step) * step;
    }
}

