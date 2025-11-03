// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import "../src/Factory.sol";
import "../src/Table.sol";
import "../src/interfaces/ITable.sol";
import "../src/mocks/MockVRFCoordinator.sol";

contract DeployTables is Script {
  function run() external {
    address factory = vm.envAddress("FACTORY_ADDR");
    address treasury = vm.envAddress("TREASURY_ADDR");
    
    vm.startBroadcast();
    
    // For local dev, deploy a mock VRF coordinator
    address vrfCoordinator;
    string memory chainName = vm.envOr("CHAIN_NAME", string("anvil"));
    
    if (keccak256(bytes(chainName)) == keccak256(bytes("anvil"))) {
      // Deploy mock VRF coordinator for local development
      MockVRFCoordinator mockVRF = new MockVRFCoordinator();
      vrfCoordinator = address(mockVRF);
      console2.log("Mock VRF Coordinator deployed at:", vrfCoordinator);
    } else {
      // Use real VRF coordinator address for other chains
      vrfCoordinator = vm.envAddress("VRF_COORDINATOR");
    }
    
    bytes32 keyHash = vm.envOr("VRF_KEY_HASH", bytes32(0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314));
    uint64 subscriptionId = uint64(vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0)));
    uint32 callbackGasLimit = uint32(vm.envOr("VRF_CALLBACK_GAS_LIMIT", uint256(500000)));

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


