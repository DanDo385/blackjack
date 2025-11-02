// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {Factory} from "../src/Factory.sol";
import {Table} from "../src/Table.sol";
import {ITable} from "../src/interfaces/ITable.sol";
import {MockVRFCoordinatorV2} from "./mocks/MockVRFCoordinatorV2.sol";
import {TestHelpers} from "./helpers/TestHelpers.sol";

contract FactoryTest is Test {
    Factory public factory;
    MockVRFCoordinatorV2 public vrfCoordinator;
    address public owner;
    address public treasury;
    address public user;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit;

    event TableCreated(address indexed table, bool premier);

    function setUp() public {
        owner = address(this);
        treasury = address(0x123);
        user = address(0x456);
        keyHash = bytes32(uint256(0x123));
        subscriptionId = 1;
        callbackGasLimit = 500000;

        factory = new Factory();
        vrfCoordinator = new MockVRFCoordinatorV2();
    }

    function test_Owner() public {
        assertEq(factory.owner(), address(this));
    }

    function test_CreateStandardTable() public {
        ITable.Rules memory rules = TestHelpers.createStandardRules();

        vm.expectEmit(true, false, false, true);
        emit TableCreated(address(0), false);

        address tableAddress = factory.createTable(
            rules,
            treasury,
            false,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );

        assertNotEq(tableAddress, address(0));
        Table table = Table(payable(tableAddress));
        assertEq(table.owner(), address(this));
        assertEq(table.treasury(), treasury);
        assertEq(table.rules().decks, 7);
        assertEq(table.rules().penetrationBps, 6700);
        assertEq(table.rules().bjPayoutBps, 14000);
        assertEq(table.spreadNum(), 4);
        assertEq(table.growthCapBps(), 3300);
    }

    function test_CreatePremierTable() public {
        ITable.Rules memory rules = TestHelpers.createPremierRules();

        vm.expectEmit(true, false, false, true);
        emit TableCreated(address(0), true);

        address tableAddress = factory.createTable(
            rules,
            treasury,
            true,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );

        assertNotEq(tableAddress, address(0));
        Table table = Table(payable(tableAddress));
        assertEq(table.rules().bjPayoutBps, 15000);
        assertEq(table.spreadNum(), 5);
        assertEq(table.growthCapBps(), 4000);
    }

    function test_CreateMultipleTables() public {
        ITable.Rules memory stdRules = TestHelpers.createStandardRules();
        ITable.Rules memory premRules = TestHelpers.createPremierRules();

        address stdTable = factory.createTable(
            stdRules,
            treasury,
            false,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );

        address premTable = factory.createTable(
            premRules,
            treasury,
            true,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );

        assertNotEq(stdTable, premTable);
        assertNotEq(stdTable, address(0));
        assertNotEq(premTable, address(0));
    }

    function test_CreateTableWithCustomRules() public {
        ITable.Rules memory rules = TestHelpers.createCustomRules(
            8,      // decks
            7000,   // penetrationBps
            false,  // hitSoft17
            16000,  // bjPayoutBps
            false,  // allowDAS
            true,   // allowSurrender
            false,  // splitAcesOnce
            true    // midShoeEntry
        );

        address tableAddress = factory.createTable(
            rules,
            treasury,
            false,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );

        Table table = Table(payable(tableAddress));
        assertEq(table.rules().decks, 8);
        assertEq(table.rules().penetrationBps, 7000);
        assertEq(table.rules().hitSoft17, false);
        assertEq(table.rules().bjPayoutBps, 16000);
        assertEq(table.rules().allowDAS, false);
        assertEq(table.rules().allowSurrender, true);
        assertEq(table.rules().splitAcesOnce, false);
        assertEq(table.rules().midShoeEntry, true);
    }

    function test_RevertWhen_NonOwnerCreatesTable() public {
        ITable.Rules memory rules = TestHelpers.createStandardRules();

        vm.prank(user);
        vm.expectRevert("not owner");
        factory.createTable(
            rules,
            treasury,
            false,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );
    }

    function test_RevertWhen_ZeroTreasury() public {
        ITable.Rules memory rules = TestHelpers.createStandardRules();

        // This should not revert in Factory, but Table might have issues
        // Testing that Factory allows it
        address tableAddress = factory.createTable(
            rules,
            address(0),
            false,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );

        assertNotEq(tableAddress, address(0));
    }

    function test_CreateTableWithDifferentVRFConfigs() public {
        ITable.Rules memory rules = TestHelpers.createStandardRules();
        bytes32 customKeyHash = bytes32(uint256(0x456));
        uint64 customSubId = 999;
        uint32 customGasLimit = 1000000;

        address tableAddress = factory.createTable(
            rules,
            treasury,
            false,
            address(vrfCoordinator),
            customKeyHash,
            customSubId,
            customGasLimit
        );

        Table table = Table(payable(tableAddress));
        assertEq(table.keyHash(), customKeyHash);
        assertEq(table.subscriptionId(), customSubId);
        assertEq(table.callbackGasLimit(), customGasLimit);
    }

    function test_Fuzz_CreateTable(uint8 decks, uint16 penetrationBps, bool premier) public {
        vm.assume(decks > 0 && decks <= 10);
        vm.assume(penetrationBps > 0 && penetrationBps <= 10000);

        ITable.Rules memory rules = TestHelpers.createCustomRules(
            decks,
            penetrationBps,
            true,
            premier ? uint16(15000) : uint16(14000),
            true,
            false,
            true,
            false
        );

        address tableAddress = factory.createTable(
            rules,
            treasury,
            premier,
            address(vrfCoordinator),
            keyHash,
            subscriptionId,
            callbackGasLimit
        );

        assertNotEq(tableAddress, address(0));
        Table table = Table(payable(tableAddress));
        assertEq(table.rules().decks, decks);
        assertEq(table.rules().penetrationBps, penetrationBps);
    }
}

