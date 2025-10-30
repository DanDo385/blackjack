// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITable} from "./interfaces/ITable.sol";

contract Table is ITable {
  Rules public rules;
  address public owner;
  address public treasury;

  uint256 public shoeId;
  uint256 public cardsDealt;
  uint256 public reshuffleAt;

  // wagering rails
  uint256 public spreadNum;        // 4 (std) or 5 (premier)
  uint256 public growthCapBps;     // 3300 or 4000
  uint256 public stepBps;          // 500 (5%)
  uint256 public tableMin;         // in token units (example rails)
  uint256 public tableMax;

  struct PState { uint256 anchor; uint256 lastBet; uint8 playedCount10; uint8 totalCount10; }
  mapping(address => PState) public pstate;

  struct Hand { address player; address token; uint256 amount; uint256 usdcRef; bool settled; bytes32 seed; }
  mapping(uint256 => Hand) public hands; uint256 public nextHandId;

  constructor(Rules memory r, address _treasury, address _owner, bool premier) {
    rules = r; treasury = _treasury; owner = _owner;
    shoeId = 1; reshuffleAt = r.decks * 52 * r.penetrationBps / 10000;
    if (premier) { spreadNum = 5; growthCapBps = 4000; } else { spreadNum = 4; growthCapBps = 3300; }
    stepBps = 500; tableMin = 1e6; tableMax = 1_000_000e6; // demo values
  }

  function _bounds(address u) internal view returns (uint256 minV, uint256 maxV) {
    PState memory s = pstate[u];
    uint256 anchor = s.anchor == 0 ? tableMin : s.anchor;
    minV = anchor / spreadNum; if (minV < tableMin) minV = tableMin;
    maxV = anchor * spreadNum; if (maxV > tableMax) maxV = tableMax;
  }

  function _applyGrowthCap(address u, uint256 desired) internal view returns (uint256) {
    PState memory s = pstate[u];
    if (s.lastBet == 0) return desired;
    uint256 maxUp = s.lastBet * (10000 + growthCapBps) / 10000;
    if (desired > maxUp) return maxUp;
    return desired;
  }

  function placeBet(address token, uint256 amount, uint256 usdcRef, bytes32 /*quoteId*/) external returns (uint256 handId) {
    (uint256 minV, uint256 maxV) = _bounds(msg.sender);
    uint256 capped = _applyGrowthCap(msg.sender, amount);
    if (capped < amount) amount = capped;

    // step (5% of anchor): round to nearest step
    uint256 anchor = pstate[msg.sender].anchor == 0 ? tableMin : pstate[msg.sender].anchor;
    uint256 step = anchor * stepBps / 10000;
    if (step == 0) step = 1;
    amount = (amount / step) * step;

    require(amount >= minV && amount <= maxV, "BetOutOfBounds");
    IERC20(token).transferFrom(msg.sender, address(this), amount);

    handId = nextHandId++;
    hands[handId] = Hand({player: msg.sender, token: token, amount: amount, usdcRef: usdcRef, settled:false, seed:bytes32(0)});
    emit HandStarted(handId, msg.sender, token, amount, bytes32(0));
  }

  function fulfillRandomness(uint256 handId, bytes32 seed) external {
    require(hands[handId].player != address(0));
    require(hands[handId].seed==bytes32(0));
    hands[handId].seed = seed;
    emit RandomFulfilled(handId, seed);
  }

  function settle(uint256 handId) external {
    Hand storage h = hands[handId];
    require(!h.settled, "settled");
    require(h.seed!=bytes32(0), "not ready");

    // (off-chain engine computes) — placeholder loss:
    bool playerWin = false;
    uint256 payout = 0;
    uint256 feeLink = 0;
    uint256 feeNickelRef = 5;

    if (playerWin) {
      IERC20(h.token).transfer(h.player, h.amount + payout);
    }

    h.settled = true;
    // session updates
    PState storage s = pstate[h.player];
    s.lastBet = h.amount;
    if (s.anchor == 0) s.anchor = h.amount;

    cardsDealt += 4; // minimal progress
    if (cardsDealt >= reshuffleAt) { shoeId++; cardsDealt = 0; emit Reshuffle(shoeId); }

    emit HandSettled(handId, h.player, playerWin?int256(h.amount): -int256(h.amount), h.token, payout, feeLink, feeNickelRef);
  }
}


