// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import "../src/Factory.sol";
import "../src/Table.sol";
import "../src/interfaces/ITable.sol";

contract DeployTables is Script {
  function run() external {
    address factory = vm.envAddress("FACTORY_ADDR");
    address treasury = vm.envAddress("TREASURY_ADDR");
    
    // VRF Configuration - defaults for local dev (can be overridden via env vars)
    address vrfCoordinator = vm.envOr("VRF_COORDINATOR", address(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625)); // Base Sepolia default
    bytes32 keyHash = vm.envOr("VRF_KEY_HASH", bytes32(0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314)); // Base Sepolia 500 gwei
    uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0))); // Must be set for production
    uint32 callbackGasLimit = uint32(vm.envOr("VRF_CALLBACK_GAS_LIMIT", uint256(500000))); // Default 500k gas
    
    vm.startBroadcast();

    ITable.Rules memory r = ITable.Rules({
      decks: 7,
      penetrationBps: 6700,
      hitSoft17: true,
      bjPayoutBps: 14000,        // overwritten for premier
      allowDAS: true,
      allowSurrender: false,
      splitAcesOnce: true,
      midShoeEntry: false
    });

    Factory f = Factory(factory);
    address stdTable = f.createTable(r, treasury, false, vrfCoordinator, keyHash, subscriptionId, callbackGasLimit);

    r.bjPayoutBps = 15000;
    address premTable = f.createTable(r, treasury, true, vrfCoordinator, keyHash, subscriptionId, callbackGasLimit);

    console2.log("Standard Table:", stdTable);
    console2.log("Premier Table:", premTable);
    console2.log("VRF Coordinator:", vrfCoordinator);
    console2.log("Subscription ID:", subscriptionId);
    vm.stopBroadcast();
  }
}


