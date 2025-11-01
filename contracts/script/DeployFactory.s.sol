// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "forge-std/Script.sol";
import "../src/Factory.sol";

contract DeployFactory is Script {
  function run() external {
    vm.startBroadcast();
    Factory f = new Factory();
    console2.log("Factory:", address(f));
    vm.stopBroadcast();
  }
}


