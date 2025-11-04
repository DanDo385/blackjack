// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./Table.sol";
contract Factory {
  address public owner;
  event TableCreated(address table);
  constructor(){ owner = msg.sender; }
  modifier onlyOwner { require(msg.sender==owner, "not owner"); _; }

  function createTable(
    Table.Rules calldata r,
    address treasury,
    address vrfCoordinator,
    bytes32 keyHash,
    uint64 subscriptionId,
    uint32 callbackGasLimit
  ) external onlyOwner returns(address){
    Table t = new Table(r, treasury, msg.sender, vrfCoordinator, keyHash, subscriptionId, callbackGasLimit);
    emit TableCreated(address(t));
    return address(t);
  }
}


