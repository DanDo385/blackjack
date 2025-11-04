// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITable {
  struct Rules {
    uint8 decks;            // 7
    uint16 penetrationBps;  // 6700
    bool hitSoft17;         // true
    uint16 bjPayoutBps;     // 14000 (7:5 payout)
    bool allowDAS;          // true (non-aces)
    bool allowSurrender;    // false
    bool splitAcesOnce;     // true
    bool midShoeEntry;      // false
  }

  event HandStarted(uint256 indexed handId, address indexed player, address token, uint256 amount, bytes32 vrfReqId);
  event RandomFulfilled(uint256 indexed handId, bytes32 seed);
  event HandSettled(uint256 indexed handId, address indexed player, int256 pnl, address payoutToken, uint256 payoutAmount, uint256 feeLink, uint256 feeNickelRef);
  event Reshuffle(uint256 indexed shoeId);

  function placeBet(address token, uint256 amount, uint256 usdcRef, bytes32 quoteId) external returns (uint256 handId);
  function settle(uint256 handId) external;
}


