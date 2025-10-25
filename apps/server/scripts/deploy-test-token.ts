import { Wallet, JsonRpcProvider } from "ethers";

/**
 * Script para deployar token ERC20 de teste na Amoy Testnet
 *
 * Uso:
 * PRIVATE_KEY=0x... npx tsx scripts/deploy-test-token.ts
 */

const ERC20_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestUSDC {
    string public name = "Test USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    // Mint function para testes (permite criar novos tokens)
    function mint(address _to, uint256 _amount) public returns (bool success) {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
        return true;
    }
}
`;

async function deployTestToken() {
  // Configura provider (Amoy testnet)
  const provider = new JsonRpcProvider("https://rpc-amoy.polygon.technology");

  // Carrega wallet
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY não definida!");
    console.log("Uso: PRIVATE_KEY=0x... npx tsx scripts/deploy-test-token.ts");
    process.exit(1);
  }

  const wallet = new Wallet(privateKey, provider);
  console.log("📍 Deploying from:", wallet.address);

  // Verifica saldo MATIC
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 MATIC balance:", balance.toString());

  if (balance === BigInt(0)) {
    console.error("❌ Sem MATIC! Consiga testnet MATIC em https://faucet.polygon.technology/");
    process.exit(1);
  }

  console.log("\n🚀 Para deployar o contrato, você precisa:");
  console.log("1. Instalar hardhat: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox");
  console.log("2. Ou use Remix IDE: https://remix.ethereum.org/");
  console.log("\n📝 Código do contrato:");
  console.log(ERC20_SOURCE);
  console.log("\n💡 Após deploy, adicione o endereço do token em src/lib/tokens.ts");
}

deployTestToken().catch(console.error);
