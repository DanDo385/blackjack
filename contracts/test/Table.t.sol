// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {Table} from "../src/Table.sol";
import {ITable} from "../src/interfaces/ITable.sol";
import {MockVRFCoordinatorV2} from "./mocks/MockVRFCoordinatorV2.sol";
import {TestERC20} from "./mocks/TestERC20.sol";
import {TestHelpers} from "./helpers/TestHelpers.sol";

contract TableTest is Test {
    Table public table;
    MockVRFCoordinatorV2 public vrfCoordinator;
    TestERC20 public token;
    address public owner;
    address public treasury;
    address public player;
    address public player2;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit;

    event HandStarted(uint256 indexed handId, address indexed player, address token, uint256 amount, bytes32 vrfReqId);
    event RandomFulfilled(uint256 indexed handId, bytes32 seed);
    event HandSettled(uint256 indexed handId, address indexed player, int256 pnl, address payoutToken, uint256 payoutAmount, uint256 feeLink, uint256 feeNickelRef);
    event Reshuffle(uint256 indexed shoeId);

    function setUp() public {
        owner = address(this);
        treasury = address(0x123);
        player = address(0x456);
        player2 = address(0x789);
        keyHash = bytes32(uint256(0x123));
        subscriptionId = 1;
        callbackGasLimit = 500000;

        vrfCoordinator = new MockVRFCoordinatorV2();
        token = new TestERC20("Test Token", "TEST", 6);
        token.mint(player, 1000000e6);
        token.mint(player2, 1000000e6);

        // Create table
        ITable.Rules memory rules = TestHelpers.createStandardRules();
        table = new Table(
            rules,
            treasury,
            owner,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );
    }

    // ============ Constructor Tests ============

    function test_Constructor_SetsRulesCorrectly() public {
        assertEq(table.rules().decks, 7);
        assertEq(table.rules().penetrationBps, 6700);
        assertEq(table.rules().hitSoft17, true);
        assertEq(table.rules().bjPayoutBps, 14000);
        assertEq(table.owner(), owner);
        assertEq(table.treasury(), treasury);
    }

    function test_Constructor_SetsWageringRails() public {
        assertEq(table.spreadNum(), 4);
        assertEq(table.growthCapBps(), 3300);
        assertEq(table.stepBps(), 500);
        assertEq(table.tableMin(), 1e6);
        assertEq(table.tableMax(), 1_000_000e6);
    }

    function test_Constructor_CalculatesReshuffleAt() public {
        uint256 expected = TestHelpers.calculateReshuffleAt(7, 6700);
        assertEq(table.reshuffleAt(), expected);
    }

    function test_Constructor_InitializesShoeId() public {
        assertEq(table.shoeId(), 1);
        assertEq(table.cardsDealt(), 0);
    }

    // ============ Bet Placement Tests ============

    function test_PlaceBet_FirstBet() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        vm.expectEmit(true, true, false, true);
        emit HandStarted(0, player, address(token), betAmount, bytes32(0));

        uint256 handId = table.placeBet(address(token), betAmount, 100e6, bytes32(0));

        assertEq(handId, 0);
        assertEq(table.nextHandId(), 1);
        assertEq(token.balanceOf(address(table)), betAmount);
        assertEq(token.balanceOf(player), 1000000e6 - betAmount);

        Table.Hand memory hand = table.hands(handId);
        assertEq(hand.player, player);
        assertEq(hand.token, address(token));
        assertEq(hand.amount, betAmount);
        assertEq(hand.settled, false);
        assertEq(hand.seed, bytes32(0));
    }

    function test_PlaceBet_RoundsToStep() public {
        uint256 anchor = 100e6;
        uint256 step = anchor * table.stepBps() / 10000; // 5% of 100e6 = 5e6

        // First bet sets anchor
        token.approve(address(table), anchor);
        table.placeBet(address(token), anchor, anchor, bytes32(0));

        // Bet amount that should round down
        uint256 betAmount = anchor + step / 2; // 102.5e6 should round to 100e6 (nearest step)
        token.approve(address(table), betAmount);
        uint256 handId = table.placeBet(address(token), betAmount, anchor, bytes32(0));

        // Should round to nearest step (which is anchor itself)
        uint256 expectedAmount = TestHelpers.roundToStep(betAmount, step);
        assertEq(table.hands(handId).amount, expectedAmount);
    }

    function test_PlaceBet_RequestsVRF() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, 100e6, bytes32(0));

        // Check that VRF request was made
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        assertEq(table.requestIdToHandId(requestId), handId);
    }

    function test_PlaceBet_UpdatesPlayerState() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        table.placeBet(address(token), betAmount, 100e6, bytes32(0));

        Table.PState memory state = table.pstate(player);
        assertEq(state.lastBet, betAmount);
        assertEq(state.anchor, 0); // Anchor set after settlement
    }

    function test_RevertWhen_BetBelowMinimum() public {
        uint256 betAmount = table.tableMin() - 1;
        token.approve(address(table), betAmount);

        vm.expectRevert("BetOutOfBounds");
        table.placeBet(address(token), betAmount, betAmount, bytes32(0));
    }

    function test_RevertWhen_BetAboveMaximum() public {
        uint256 betAmount = table.tableMax() + 1;
        token.approve(address(table), betAmount);

        vm.expectRevert("BetOutOfBounds");
        table.placeBet(address(token), betAmount, betAmount, bytes32(0));
    }

    function test_RevertWhen_InsufficientAllowance() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount - 1);

        vm.expectRevert();
        table.placeBet(address(token), betAmount, betAmount, bytes32(0));
    }

    function test_RevertWhen_InsufficientBalance() public {
        uint256 betAmount = 100e6;
        token.burn(player, 1000000e6);
        token.mint(player, betAmount - 1);
        token.approve(address(table), betAmount);

        vm.expectRevert();
        table.placeBet(address(token), betAmount, betAmount, bytes32(0));
    }

    // ============ Wagering Rails Tests ============

    function test_Bounds_FirstBetUsesTableMin() public {
        // Test by trying to place a bet at tableMin (should succeed)
        uint256 minBet = table.tableMin();
        token.approve(address(table), minBet);
        uint256 handId = table.placeBet(address(token), minBet, minBet, bytes32(0));
        assertEq(table.hands(handId).amount, minBet);
    }

    function test_Bounds_AfterFirstBetUsesAnchor() public {
        uint256 anchor = 100e6;
        token.approve(address(table), anchor);
        table.placeBet(address(token), anchor, anchor, bytes32(0));

        // Fulfill VRF and settle to set anchor
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));
        table.settle(0);

        // After anchor is set, min bet should be anchor / spreadNum
        uint256 expectedMin = TestHelpers.calculateMinBet(anchor, table.spreadNum(), table.tableMin());
        token.approve(address(table), expectedMin);
        uint256 handId = table.placeBet(address(token), expectedMin, expectedMin, bytes32(0));
        assertEq(table.hands(handId).amount, expectedMin);
    }

    function test_GrowthCap_FirstBetNoCap() public {
        // First bet should not be capped
        uint256 desired = 1000e6;
        token.approve(address(table), desired);
        uint256 handId = table.placeBet(address(token), desired, desired, bytes32(0));
        // Should succeed, amount might be rounded to step but not capped
        assertEq(table.hands(handId).amount, desired);
    }

    function test_GrowthCap_EnforcesMaxIncrease() public {
        uint256 lastBet = 100e6;
        uint256 growthCapBps = table.growthCapBps();

        // Set last bet
        token.approve(address(table), lastBet);
        table.placeBet(address(token), lastBet, lastBet, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));
        table.settle(0);

        // Try to bet more than growth cap allows
        uint256 desired = 200e6; // 100% increase
        uint256 maxAllowed = TestHelpers.calculateGrowthCap(lastBet, growthCapBps);
        token.approve(address(table), desired);
        
        // The bet should be capped to maxAllowed
        uint256 handId = table.placeBet(address(token), desired, desired, bytes32(0));
        uint256 actualBet = table.hands(handId).amount;
        
        // Amount might be rounded to step, but should be <= maxAllowed
        assertLe(actualBet, maxAllowed);
        assertLt(actualBet, desired);
    }

    function test_GrowthCap_StandardTable() public {
        uint256 lastBet = 100e6;
        token.approve(address(table), lastBet);
        table.placeBet(address(token), lastBet, lastBet, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));
        table.settle(0);

        uint256 maxAllowed = lastBet * (10000 + table.growthCapBps()) / 10000;
        assertEq(maxAllowed, 133e6); // 100e6 * 1.33 = 133e6
    }

    // ============ VRF Fulfillment Tests ============

    function test_FulfillRandomWords_SetsSeed() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;

        vm.expectEmit(true, false, false, true);
        emit RandomFulfilled(handId, bytes32(0));

        vrfCoordinator.fulfillRandomWords(requestId, address(table));

        Table.Hand memory hand = table.hands(handId);
        assertNotEq(hand.seed, bytes32(0));
    }

    function test_FulfillRandomWords_UpdatesHand() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;

        vrfCoordinator.fulfillRandomWords(requestId, address(table));

        Table.Hand memory hand = table.hands(handId);
        assertNotEq(hand.seed, bytes32(0));
    }

    function test_RevertWhen_FulfillRandomWordsTwice() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;

        vrfCoordinator.fulfillRandomWords(requestId, address(table));

        vm.expectRevert("SeedAlreadySet");
        vrfCoordinator.fulfillRandomWords(requestId, address(table));
    }

    // ============ Settlement Tests ============

    function test_Settle_UpdatesHandState() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));

        vm.expectEmit(true, true, false, true);
        emit HandSettled(handId, player, -int256(betAmount), address(token), 0, 0, 5);

        table.settle(handId);

        Table.Hand memory hand = table.hands(handId);
        assertTrue(hand.settled);
    }

    function test_Settle_UpdatesPlayerState() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));
        table.settle(handId);

        Table.PState memory state = table.pstate(player);
        assertEq(state.lastBet, betAmount);
        assertEq(state.anchor, betAmount); // Anchor set on first settlement
    }

    function test_Settle_UpdatesCardsDealt() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));

        uint256 cardsBefore = table.cardsDealt();
        table.settle(handId);
        assertEq(table.cardsDealt(), cardsBefore + 4);
    }

    function test_Settle_TriggersReshuffle() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        // Set cardsDealt close to reshuffle threshold
        uint256 cardsNeeded = table.reshuffleAt() - table.cardsDealt() - 3;
        // Manipulate cardsDealt (in real scenario this would be done through multiple hands)
        // For testing, we'll just play enough hands to trigger reshuffle
        uint256 handsNeeded = cardsNeeded / 4;

        for (uint256 i = 0; i < handsNeeded; i++) {
            uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
            uint256 requestId = vrfCoordinator.requestCounter() - 1;
            vrfCoordinator.fulfillRandomWords(requestId, address(table));
            table.settle(handId);
        }

        // One more hand should trigger reshuffle
        uint256 finalHandId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 finalRequestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(finalRequestId, address(table));

        uint256 shoeIdBefore = table.shoeId();
        vm.expectEmit(true, false, false, true);
        emit Reshuffle(shoeIdBefore + 1);

        table.settle(finalHandId);

        assertEq(table.shoeId(), shoeIdBefore + 1);
        assertEq(table.cardsDealt(), 0);
    }

    function test_RevertWhen_SettleBeforeVRF() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));

        vm.expectRevert("not ready");
        table.settle(handId);
    }

    function test_RevertWhen_SettleTwice() public {
        uint256 betAmount = 100e6;
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));
        table.settle(handId);

        vm.expectRevert("settled");
        table.settle(handId);
    }

    // ============ Multiple Players Tests ============

    function test_MultiplePlayers_IndependentState() public {
        uint256 betAmount1 = 100e6;
        uint256 betAmount2 = 200e6;

        token.approve(address(table), betAmount1);
        vm.prank(player);
        uint256 handId1 = table.placeBet(address(token), betAmount1, betAmount1, bytes32(0));

        token.approve(address(table), betAmount2);
        vm.prank(player2);
        uint256 handId2 = table.placeBet(address(token), betAmount2, betAmount2, bytes32(0));

        assertEq(table.hands(handId1).player, player);
        assertEq(table.hands(handId2).player, player2);
        assertEq(table.hands(handId1).amount, betAmount1);
        assertEq(table.hands(handId2).amount, betAmount2);
    }

    function test_MultiplePlayers_IndependentAnchors() public {
        uint256 betAmount1 = 100e6;
        uint256 betAmount2 = 200e6;

        token.approve(address(table), betAmount1);
        vm.prank(player);
        uint256 handId1 = table.placeBet(address(token), betAmount1, betAmount1, bytes32(0));
        uint256 requestId1 = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId1, address(table));
        vm.prank(player);
        table.settle(handId1);

        token.approve(address(table), betAmount2);
        vm.prank(player2);
        uint256 handId2 = table.placeBet(address(token), betAmount2, betAmount2, bytes32(0));
        uint256 requestId2 = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId2, address(table));
        vm.prank(player2);
        table.settle(handId2);

        assertEq(table.pstate(player).anchor, betAmount1);
        assertEq(table.pstate(player2).anchor, betAmount2);
    }

    // ============ Fuzz Tests ============

    function test_Fuzz_PlaceBet(uint256 betAmount) public {
        betAmount = bound(betAmount, table.tableMin(), table.tableMax());
        token.mint(player, betAmount);
        token.approve(address(table), betAmount);

        uint256 handId = table.placeBet(address(token), betAmount, betAmount, bytes32(0));
        assertEq(table.hands(handId).amount, betAmount);
        assertEq(table.hands(handId).player, player);
    }

    function test_Fuzz_BoundsRespectLimits(uint256 anchor) public {
        anchor = bound(anchor, table.tableMin(), table.tableMax());
        
        // Set anchor by playing and settling a bet
        token.approve(address(table), anchor);
        uint256 handId = table.placeBet(address(token), anchor, anchor, bytes32(0));
        uint256 requestId = vrfCoordinator.requestCounter() - 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(table));
        table.settle(handId);

        // Test that we can place bets within bounds
        uint256 expectedMin = TestHelpers.calculateMinBet(anchor, table.spreadNum(), table.tableMin());
        uint256 expectedMax = TestHelpers.calculateMaxBet(anchor, table.spreadNum(), table.tableMax());
        
        // Test min bet
        expectedMin = bound(expectedMin, table.tableMin(), table.tableMax());
        token.approve(address(table), expectedMin);
        uint256 minHandId = table.placeBet(address(token), expectedMin, expectedMin, bytes32(0));
        assertGe(table.hands(minHandId).amount, table.tableMin());
        
        // Test max bet
        expectedMax = bound(expectedMax, table.tableMin(), table.tableMax());
        token.approve(address(table), expectedMax);
        uint256 maxHandId = table.placeBet(address(token), expectedMax, expectedMax, bytes32(0));
        assertLe(table.hands(maxHandId).amount, table.tableMax());
    }
}

