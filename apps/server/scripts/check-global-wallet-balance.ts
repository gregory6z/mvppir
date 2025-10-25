// IMPORTANTE: Importar env PRIMEIRO para carregar .env.test corretamente
import { env } from "../src/config/env";
import { JsonRpcProvider, formatEther, formatUnits } from "ethers";
import { prisma } from "../src/lib/prisma";

/**
 * Verifica saldo da Global Wallet na blockchain
 *
 * Uso:
 * npx tsx scripts/check-global-wallet-balance.ts
 */

async function checkGlobalWalletBalance() {
  console.log("🔍 Verificando saldo da Global Wallet...\n");
  console.log("DEBUG - DATABASE_URL:", env.DATABASE_URL);
  console.log("DEBUG - NODE_ENV:", env.NODE_ENV);
  console.log("");

  // 1. Busca Global Wallet do banco
  const globalWallet = await prisma.globalWallet.findFirst();
  console.log("DEBUG - Result:", globalWallet ? "Found" : "Not found");

  if (!globalWallet) {
    console.error("❌ Global Wallet não encontrada no banco!");
    console.log("Execute: npx tsx scripts/create-global-wallet.ts");
    process.exit(1);
  }

  console.log("✅ Global Wallet encontrada:");
  console.log(`   ID: ${globalWallet.id}`);
  console.log(`   Address: ${globalWallet.polygonAddress}`);
  console.log("");

  // 2. Conecta ao RPC
  console.log("🌐 Conectando ao RPC...");
  console.log(`   URL: ${env.POLYGON_RPC_URL}`);
  console.log(`   Chain ID: ${env.POLYGON_CHAIN_ID}`);
  console.log("");

  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);

  try {
    // 3. Verifica saldo MATIC
    console.log("💰 Verificando saldo MATIC...");
    const maticBalance = await provider.getBalance(
      globalWallet.polygonAddress
    );
    const maticFormatted = formatEther(maticBalance);

    console.log(`   MATIC: ${maticFormatted} MATIC`);

    if (parseFloat(maticFormatted) === 0) {
      console.log("");
      console.log("⚠️  Sem MATIC! Você precisa de MATIC para pagar gas fees.");
      console.log("");
      console.log("🎯 Consiga MATIC testnet gratuito:");
      console.log("   → https://faucet.polygon.technology/");
      console.log("   → Selecione 'Polygon Amoy'");
      console.log(`   → Cole o endereço: ${globalWallet.polygonAddress}`);
      console.log("");
    } else if (parseFloat(maticFormatted) < 0.1) {
      console.log("   ⚠️  Saldo baixo! Recomendado: pelo menos 0.5 MATIC");
    } else {
      console.log("   ✅ Saldo suficiente para testes!");
    }

    // 4. Verifica tokens ERC20 conhecidos (se houver)
    console.log("");
    console.log("🪙 Verificando tokens ERC20...");

    const knownTokens = [
      {
        symbol: "USDC",
        address: "0x...", // Adicione endereço do seu TestUSDC aqui
        decimals: 6,
      },
      // Adicione outros tokens aqui
    ];

    for (const token of knownTokens) {
      if (token.address === "0x...") continue; // Skip se não configurado

      try {
        const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
        const { Contract } = await import("ethers");
        const tokenContract = new Contract(token.address, tokenAbi, provider);

        const balance = await tokenContract.balanceOf(
          globalWallet.polygonAddress
        );
        const formatted = formatUnits(balance, token.decimals);

        console.log(`   ${token.symbol}: ${formatted} ${token.symbol}`);
      } catch (error) {
        console.log(`   ${token.symbol}: Erro ao verificar`);
      }
    }

    console.log("");
    console.log("🔗 Ver no Explorer:");
    console.log(
      `   https://amoy.polygonscan.com/address/${globalWallet.polygonAddress}`
    );
    console.log("");

  } catch (error) {
    console.error("❌ Erro ao conectar ao RPC:", error);
    console.log("");
    console.log("Verifique se o RPC URL está correto no .env:");
    console.log(`   POLYGON_RPC_URL=${env.POLYGON_RPC_URL}`);
  }

  await prisma.$disconnect();
}

checkGlobalWalletBalance().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
