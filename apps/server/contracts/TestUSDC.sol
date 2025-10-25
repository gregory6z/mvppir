// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TestUSDC - Token ERC20 de teste para Polygon Amoy
 *
 * Deploy via Remix: https://remix.ethereum.org/
 *
 * Features:
 * - 6 decimals (igual USDC real)
 * - Função mint() pública (qualquer um pode criar tokens)
 * - Supply inicial de 1 milhão de USDC
 */
contract TestUSDC {
    string public name = "Test USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        // Minta 1 milhão de USDC para o deployer
        uint256 initialSupply = 1_000_000 * (10 ** uint256(decimals));
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(value <= balanceOf[from], "Insufficient balance");
        require(value <= allowance[from][msg.sender], "Insufficient allowance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }

    /**
     * Função pública de mint - qualquer um pode criar tokens de teste!
     * Útil para testes sem precisar de faucet
     */
    function mint(address to, uint256 amount) public returns (bool success) {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    /**
     * Helper para mintar com valor em formato humano
     * Exemplo: mintHuman(recipient, 100) = 100 USDC
     */
    function mintHuman(address to, uint256 amountHuman) public returns (bool success) {
        uint256 amount = amountHuman * (10 ** uint256(decimals));
        return mint(to, amount);
    }
}
