// IMPORTANTE: Importar env PRIMEIRO para carregar .env.test corretamente
import { env } from "../src/config/env";
import { Wallet } from "ethers";
import { encryptPrivateKey } from "../src/lib/encryption";
import { prisma } from "../src/lib/prisma";

/**
 * Cria uma Global Wallet e salva no banco
 *
 * Uso:
 * npx tsx scripts/create-global-wallet.ts
 *
 * Isso vai:
 * 1. Gerar uma nova carteira aleatória
 * 2. Criptografar a private key
 * 3. Salvar no banco (tabela global_wallets)
 * 4. Exibir o endereço para você adicionar MATIC testnet
 */

async function createGlobalWallet() {
  console.log("🔐 Criando Global Wallet...\n");

  // 0. Verifica ENCRYPTION_KEY
  if (!env.ENCRYPTION_KEY || env.ENCRYPTION_KEY.length !== 64) {
    console.error("❌ ENCRYPTION_KEY inválida ou não configurada!");
    console.log("");
    console.log("A ENCRYPTION_KEY deve ter exatamente 64 caracteres hexadecimais (32 bytes).");
    console.log("");
    console.log("Adicione ao seu .env:");
    console.log('ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"');
    console.log("");
    console.log("Ou gere uma nova:");
    console.log("node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
    process.exit(1);
  }

  // 1. Cria wallet aleatória
  const wallet = Wallet.createRandom();

  console.log("✅ Carteira gerada:");
  console.log(`   Address: ${wallet.address}`);
  console.log(`   Private Key: ${wallet.privateKey}`);
  console.log("");

  // 2. Criptografa private key
  const encryptedKey = encryptPrivateKey(wallet.privateKey);

  // 3. Verifica se já existe Global Wallet
  const existing = await prisma.globalWallet.findFirst();

  if (existing) {
    console.log("⚠️  Global Wallet já existe no banco:");
    console.log(`   ID: ${existing.id}`);
    console.log(`   Address: ${existing.polygonAddress}`);
    console.log("");
    console.log("Deseja substituir? (delete manualmente no banco antes)");
    process.exit(0);
  }

  // 4. Salva no banco
  const created = await prisma.globalWallet.create({
    data: {
      polygonAddress: wallet.address.toLowerCase(),
      privateKey: encryptedKey,
    },
  });

  console.log("✅ Global Wallet salva no banco:");
  console.log(`   ID: ${created.id}`);
  console.log(`   Address: ${created.polygonAddress}`);
  console.log("");

  console.log("🎯 PRÓXIMOS PASSOS:");
  console.log("");
  console.log("1. Consiga MATIC testnet (gratuito):");
  console.log("   → https://faucet.polygon.technology/");
  console.log("   → Selecione 'Polygon Amoy'");
  console.log(`   → Cole o endereço: ${wallet.address}`);
  console.log("   → Aguarde ~30 segundos");
  console.log("");
  console.log("2. Verifique o saldo:");
  console.log(
    `   → https://amoy.polygonscan.com/address/${wallet.address}`
  );
  console.log("");
  console.log("3. Atualize seu .env:");
  console.log('   SKIP_BLOCKCHAIN_PROCESSING=false');
  console.log('   POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"');
  console.log('   POLYGON_CHAIN_ID="80002"');
  console.log("");
  console.log("4. Reinicie o servidor:");
  console.log("   npm run dev");
  console.log("");
  console.log("✅ Pronto! Agora você pode testar o fluxo completo!");

  await prisma.$disconnect();
}

createGlobalWallet().catch((error) => {
  console.error("❌ Erro ao criar Global Wallet:", error);
  process.exit(1);
});
