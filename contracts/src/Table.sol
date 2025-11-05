// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Note: In production, import from @chainlink contracts
// For now, we'll use a simplified interface that matches the required functions
// Import VRFConsumerBaseV2 from chainlink-brownie-contracts when submodule is initialized
import {VRFConsumerBaseV2} from "@chainlink/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {ITable} from "./interfaces/ITable.sol";

contract Table is ITable, VRFConsumerBaseV2 {
  Rules public rules;
  address public owner;
  address public treasury;

  uint256 public shoeId;
  uint256 public cardsDealt;
  uint256 public reshuffleAt;

  // wagering rails
  uint256 public spreadNum;        // 4 (fixed)
  uint256 public growthCapBps;     // 3300 (fixed)
  uint256 public stepBps;          // 500 (5%)
  uint256 public tableMin;         // in token units (example rails)
  uint256 public tableMax;

  // VRF Configuration
  VRFCoordinatorV2Interface public immutable vrfCoordinator;
  bytes32 public immutable keyHash;
  uint64 public immutable subscriptionId;
  uint32 public immutable callbackGasLimit;
  uint16 public constant REQUEST_CONFIRMATIONS = 3;
  uint32 public constant NUM_WORDS = 1;

  // Mapping VRF requestId to handId
  mapping(uint256 => uint256) public requestIdToHandId;

  struct PState { uint256 anchor; uint256 lastBet; uint8 playedCount10; uint8 totalCount10; }
  mapping(address => PState) public pstate;

  struct Hand { address player; address token; uint256 amount; uint256 usdcRef; bool settled; bytes32 seed; }
  mapping(uint256 => Hand) public hands; uint256 public nextHandId;

  constructor(
    Rules memory r,
    address _treasury,
    address _owner,
    address _vrfCoordinator,
    bytes32 _keyHash,
    uint64 _subscriptionId,
    uint32 _callbackGasLimit
  ) VRFConsumerBaseV2(_vrfCoordinator) {
    rules = r;
    treasury = _treasury;
    owner = _owner;
    shoeId = 1;
    reshuffleAt = uint256(r.decks) * 52 * uint256(r.penetrationBps) / 10000;
    // Fixed wagering rules (Standard only)
    spreadNum = 4;
    growthCapBps = 3300;
    stepBps = 500;
    tableMin = 1e6;
    tableMax = 1_000_000e6;

    vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    keyHash = _keyHash;
    subscriptionId = _subscriptionId;
    callbackGasLimit = _callbackGasLimit;
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
    
    // Request randomness from Chainlink VRF
    uint256 requestId = vrfCoordinator.requestRandomWords(
      keyHash,
      subscriptionId,
      REQUEST_CONFIRMATIONS,
      callbackGasLimit,
      NUM_WORDS
    );
    
    // Map requestId to handId so we can identify which hand this randomness is for
    requestIdToHandId[requestId] = handId;
    
    emit HandStarted(handId, msg.sender, token, amount, bytes32(requestId));
  }

  /**
   * @notice Callback function used by VRF Coordinator
   * @param requestId The VRF request ID
   * @param randomWords The array of random values returned by VRF
   */
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    uint256 handId = requestIdToHandId[requestId];
    require(hands[handId].player != address(0), "HandNotFound");
    require(hands[handId].seed == bytes32(0), "SeedAlreadySet");
    
    // Convert random word to bytes32 seed
    bytes32 seed = bytes32(randomWords[0]);
    hands[handId].seed = seed;
    
    emit RandomFulfilled(handId, seed);
  }

  // Deprecated: Keep for backward compatibility, but VRF will call fulfillRandomWords instead
  function fulfillRandomness(uint256 handId, bytes32 seed) external {
    // This function is kept for backward compatibility but should not be used
    // VRF will automatically call fulfillRandomWords via the coordinator
    require(hands[handId].player != address(0));
    require(hands[handId].seed==bytes32(0));
    hands[handId].seed = seed;
    emit RandomFulfilled(handId, seed);
  }

  function settle(uint256 handId, uint256 cardsDealtInHand) external {
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

    // Track actual cards dealt/revealed in this hand
    // Reshuffle when 67% or more of cards have been dealt out/revealed
    cardsDealt += cardsDealtInHand;
    if (cardsDealt >= reshuffleAt) { 
      shoeId++; 
      cardsDealt = 0; 
      emit Reshuffle(shoeId); 
    }

    emit HandSettled(handId, h.player, playerWin?int256(h.amount): -int256(h.amount), h.token, payout, feeLink, feeNickelRef);
  }
}


