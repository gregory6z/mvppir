import { Wallet, JsonRpcProvider, parseEther } from "ethers";
import { prisma } from "../src/lib/prisma";
import { env } from "../src/config/env";
import { decryptPrivateKey } from "../src/lib/encryption";

/**
 * Envia MATIC testnet da Global Wallet para um endereço
 *
 * Uso:
 * npx tsx scripts/send-matic-testnet.ts 0xDESTINATION_ADDRESS 0.1
 */

async function sendMaticTestnet() {
  const [, , destinationAddress, amountStr] = process.argv;

  if (!destinationAddress || !amountStr) {
    console.error("❌ Uso incorreto!");
    console.log("");
    console.log("Uso:");
    console.log("  npx tsx scripts/send-matic-testnet.ts <endereço> <quantidade>");
    console.log("");
    console.log("Exemplo:");
    console.log("  npx tsx scripts/send-matic-testnet.ts 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB 0.1");
    process.exit(1);
  }

  // Valida endereço
  if (!destinationAddress.startsWith("0x") || destinationAddress.length !== 42) {
    console.error("❌ Endereço inválido!");
    console.log("Endereço deve ter formato: 0x... (42 caracteres)");
    process.exit(1);
  }

  // Valida quantidade
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Quantidade inválida!");
    console.log("Quantidade deve ser um número positivo (ex: 0.1)");
    process.exit(1);
  }

  console.log("💸 Enviando MATIC testnet...\n");

  // 1. Busca Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst();

  if (!globalWallet) {
    console.error("❌ Global Wallet não encontrada!");
    console.log("Execute: npx tsx scripts/create-global-wallet.ts");
    process.exit(1);
  }

  console.log("✅ Global Wallet encontrada:");
  console.log(`   Address: ${globalWallet.polygonAddress}`);
  console.log("");

  // 2. Descriptografa private key
  const privateKey = decryptPrivateKey(globalWallet.privateKey);

  // 3. Conecta ao provider
  console.log("🌐 Conectando ao RPC...");
  console.log(`   URL: ${env.POLYGON_RPC_URL}`);
  console.log(`   Chain ID: ${env.POLYGON_CHAIN_ID}`);
  console.log("");

  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);
  const wallet = new Wallet(privateKey, provider);

  // 4. Verifica saldo
  console.log("💰 Verificando saldo...");
  const balance = await provider.getBalance(wallet.address);
  const balanceFormatted = parseFloat(balance.toString()) / 1e18;

  console.log(`   Saldo atual: ${balanceFormatted.toFixed(4)} MATIC`);
  console.log("");

  if (balanceFormatted < amount) {
    console.error(`❌ Saldo insuficiente!`);
    console.log(`   Necessário: ${amount} MATIC`);
    console.log(`   Disponível: ${balanceFormatted.toFixed(4)} MATIC`);
    console.log("");
    console.log("Consiga mais MATIC testnet em:");
    console.log("👉 https://faucet.polygon.technology/");
    process.exit(1);
  }

  // 5. Envia transação
  console.log("📤 Enviando transação...");
  console.log(`   De: ${wallet.address}`);
  console.log(`   Para: ${destinationAddress}`);
  console.log(`   Quantidade: ${amount} MATIC`);
  console.log("");

  try {
    const tx = await wallet.sendTransaction({
      to: destinationAddress,
      value: parseEther(amount.toString()),
    });

    console.log(`✅ Transação enviada!`);
    console.log(`   TX Hash: ${tx.hash}`);
    console.log(`   Ver em: https://amoy.polygonscan.com/tx/${tx.hash}`);
    console.log("");

    console.log("⏳ Aguardando confirmação...");
    const receipt = await tx.wait(1);

    console.log(`✅ Transação confirmada!`);
    console.log(`   Block: ${receipt?.blockNumber}`);
    console.log(`   Status: ${receipt?.status === 1 ? "✅ Sucesso" : "❌ Falhou"}`);
    console.log("");

    // 6. Verifica novo saldo
    const newBalance = await provider.getBalance(wallet.address);
    const newBalanceFormatted = parseFloat(newBalance.toString()) / 1e18;

    console.log("💰 Novo saldo:");
    console.log(`   Global Wallet: ${newBalanceFormatted.toFixed(4)} MATIC`);
    console.log("");

    console.log("🎉 Pronto! MATIC enviado com sucesso!");
    console.log("");
    console.log("Próximos passos:");
    console.log("1. Aguarde ~30-60s para Moralis detectar");
    console.log("2. Webhook será enviado automaticamente");
    console.log("3. Verifique logs do servidor");

  } catch (error: any) {
    console.error("❌ Erro ao enviar transação:", error.message);

    if (error.code === "INSUFFICIENT_FUNDS") {
      console.log("");
      console.log("Consiga mais MATIC testnet em:");
      console.log("👉 https://faucet.polygon.technology/");
    }

    process.exit(1);
  }

  await prisma.$disconnect();
}

sendMaticTestnet().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});
