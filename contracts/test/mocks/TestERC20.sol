// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockERC20} from "forge-std/mocks/MockERC20.sol";

/**
 * @title TestERC20
 * @notice Extended MockERC20 with convenience functions for testing
 */
contract TestERC20 is MockERC20 {
    constructor(string memory name, string memory symbol, uint8 decimals) {
        initialize(name, symbol, decimals);
    }

    /**
     * @notice Mint tokens to an address
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from an address
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }

    /**
     * @notice Approve and transfer in one call
     */
    function approveAndTransfer(address owner, address spender, uint256 amount) external {
        _allowance[owner][spender] = amount;
        emit Approval(owner, spender, amount);
        _balanceOf[owner] = _balanceOf[owner] - amount;
        _balanceOf[spender] = _balanceOf[spender] + amount;
        emit Transfer(owner, spender, amount);
    }
}

