// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./Table.sol";
contract Factory {
  address public owner;
  event TableCreated(address table, bool premier);
  constructor(){ owner = msg.sender; }
  modifier onlyOwner { require(msg.sender==owner, "not owner"); _; }

  function createTable(Table.Rules calldata r, address treasury, bool premier) external onlyOwner returns(address){
    Table t = new Table(r, treasury, msg.sender, premier);
    emit TableCreated(address(t), premier);
    return address(t);
  }
}


