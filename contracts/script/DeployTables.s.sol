// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "forge-std/Script.sol";
import "../src/Factory.sol";
import "../src/Table.sol";
import "../src/interfaces/ITable.sol";

contract DeployTables is Script {
  function run() external {
    address factory = vm.envAddress("FACTORY_ADDR");
    address treasury = vm.envAddress("TREASURY_ADDR");
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
    address stdTable = f.createTable(r, treasury, false);

    r.bjPayoutBps = 15000;
    address premTable = f.createTable(r, treasury, true);

    console2.log("Standard Table:", stdTable);
    console2.log("Premier Table:", premTable);
    vm.stopBroadcast();
  }
}


