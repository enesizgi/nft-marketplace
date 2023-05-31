// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract wETH is ERC20, ERC20Permit {
    constructor() ERC20("wETH", "wETH") ERC20Permit("wETH") {
    }

    fallback() external payable {
        _mint(msg.sender, msg.value); // Wrap ETH deposited to the contract
    }

    function wrap() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        _mint(msg.sender, msg.value); // Wrap ETH sent to the contract
    }

    function unwrap(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        _burn(msg.sender, amount); // Burn wrapped ETH and send ETH to the caller
        payable(msg.sender).transfer(amount);
    }
}
