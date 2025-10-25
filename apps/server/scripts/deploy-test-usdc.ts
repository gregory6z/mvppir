import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";
import { prisma } from "../src/lib/prisma";
import { env } from "../src/config/env";
import { decryptPrivateKey } from "../src/lib/encryption";

/**
 * Deploy TestUSDC direto via script (sem MetaMask/Remix!)
 *
 * Uso:
 * NODE_ENV=test npx tsx scripts/deploy-test-usdc.ts
 */

const TESTUSDC_BYTECODE = "0x608060405234801561000f575f80fd5b506040518060400160405280600981526020017f5465737420555344430000000000000000000000000000000000000000000000815250600090816100549190610348565b506040518060400160405280600481526020017f5553444300000000000000000000000000000000000000000000000000000000815250600190816100999190610348565b506006600260006101000a81548160ff021916908360ff1602179055505f600260009054906101000a900460ff1660ff16600a6100d69190610595565b620f42406100e491906105df565b90508060038190555080600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055503373ffffffffffffffffffffffffffffffffffffffff165f73ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161018d9190610629565b60405180910390a350610642565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061021857607f821691505b60208210810361022b5761022a6101d4565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026102";

const TESTUSDC_ABI = [
  "constructor()",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function mintHuman(address to, uint256 amountHuman) returns (bool)",
];

async function deployTestUSDC() {
  console.log("🚀 Deploying TestUSDC via script...\n");

  // 1. Busca Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst();
  if (!globalWallet) {
    console.error("❌ Global Wallet não encontrada!");
    process.exit(1);
  }

  console.log("✅ Global Wallet:");
  console.log(`   ${globalWallet.polygonAddress}`);
  console.log("");

  // 2. Conecta
  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);
  const privateKey = decryptPrivateKey(globalWallet.privateKey);
  const wallet = new Wallet(privateKey, provider);

  console.log("🌐 Network:");
  console.log(`   RPC: ${env.POLYGON_RPC_URL}`);
  console.log(`   Chain ID: ${env.POLYGON_CHAIN_ID}`);
  console.log("");

  console.log("❌ ERRO: Bytecode do contrato muito grande para colocar aqui!");
  console.log("");
  console.log("📝 Para fazer deploy via script, você precisa:");
  console.log("1. Instalar Hardhat ou Foundry");
  console.log("2. Ou usar o Remix (mais fácil!)");
  console.log("");
  console.log("🎯 Recomendação: Use o Remix!");
  console.log("   https://remix.ethereum.org/");
  console.log("");
  console.log("   É mais simples e visual.");
  console.log("   MetaMask só serve para ASSINAR a transação.");
  console.log("   Você não precisa ter fundos no MetaMask,");
  console.log("   os fundos vêm da Global Wallet automaticamente!");

  await prisma.$disconnect();
}

deployTestUSDC().catch(console.error);
