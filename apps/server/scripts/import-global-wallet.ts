// IMPORTANTE: Importar env PRIMEIRO para carregar .env.test corretamente
import { env } from "../src/config/env";
import { Wallet } from "ethers";
import { encryptPrivateKey } from "../src/lib/encryption";
import { prisma } from "../src/lib/prisma";

/**
 * Importa uma Global Wallet existente e salva criptografada no banco
 *
 * Uso:
 * PRIVATE_KEY="0x..." npx tsx scripts/import-global-wallet.ts
 *
 * Ou via argumento:
 * npx tsx scripts/import-global-wallet.ts 0x...
 *
 * Isso vai:
 * 1. Validar a private key
 * 2. Criptografar usando AES-256-GCM
 * 3. Salvar no banco (tabela global_wallets)
 */

async function importGlobalWallet() {
  console.log("🔐 Importando Global Wallet existente...\n");

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

  // 1. Obter private key (via env var ou argumento)
  const privateKeyInput = process.env.PRIVATE_KEY || process.argv[2];

  if (!privateKeyInput) {
    console.error("❌ Private key não fornecida!");
    console.log("");
    console.log("Use uma das opções:");
    console.log("");
    console.log("Opção 1 (mais segura - não fica no histórico do shell):");
    console.log('PRIVATE_KEY="0x..." npx tsx scripts/import-global-wallet.ts');
    console.log("");
    console.log("Opção 2 (argumento):");
    console.log("npx tsx scripts/import-global-wallet.ts 0x...");
    console.log("");
    process.exit(1);
  }

  // 2. Validar private key e criar instância da wallet
  let wallet: Wallet;
  try {
    wallet = new Wallet(privateKeyInput);
    console.log("✅ Private key válida");
    console.log(`   Address: ${wallet.address}`);
    console.log("");
  } catch (error) {
    console.error("❌ Private key inválida!");
    console.log("");
    console.log("A private key deve estar no formato:");
    console.log("  - 64 caracteres hexadecimais");
    console.log("  - Com ou sem prefixo 0x");
    console.log("");
    console.log("Exemplo: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");
    process.exit(1);
  }

  // 3. Criptografa private key
  const encryptedKey = encryptPrivateKey(wallet.privateKey);
  console.log("✅ Private key criptografada com AES-256-GCM");
  console.log("");

  // 4. Verifica se já existe Global Wallet
  const existing = await prisma.globalWallet.findFirst();

  if (existing) {
    console.log("⚠️  Global Wallet já existe no banco:");
    console.log(`   ID: ${existing.id}`);
    console.log(`   Address: ${existing.polygonAddress}`);
    console.log("");
    console.log("Deseja substituir?");
    console.log("");
    console.log("Para substituir, primeiro delete a existente:");
    console.log("  1. Abra Prisma Studio: npx prisma studio");
    console.log("  2. Delete o registro em 'GlobalWallet'");
    console.log("  3. Rode este script novamente");
    console.log("");
    console.log("OU use SQL diretamente:");
    console.log("  DELETE FROM global_wallets;");
    console.log("");
    await prisma.$disconnect();
    process.exit(0);
  }

  // 5. Salva no banco
  const created = await prisma.globalWallet.create({
    data: {
      polygonAddress: wallet.address.toLowerCase(),
      privateKey: encryptedKey,
    },
  });

  console.log("✅ Global Wallet importada e salva no banco:");
  console.log(`   ID: ${created.id}`);
  console.log(`   Address: ${created.polygonAddress}`);
  console.log("");

  console.log("🎯 PRÓXIMOS PASSOS:");
  console.log("");
  console.log("1. Verifique se a carteira tem MATIC para pagar gas fees:");
  console.log(`   → Mainnet: https://polygonscan.com/address/${wallet.address}`);
  console.log(`   → Testnet: https://amoy.polygonscan.com/address/${wallet.address}`);
  console.log("");
  console.log("2. Se não tiver MATIC:");
  console.log("   → Testnet: https://faucet.polygon.technology/ (gratuito)");
  console.log("   → Mainnet: Envie MATIC manualmente");
  console.log("");
  console.log("3. Configure seu .env:");
  console.log(`   POLYGON_RPC_URL="${env.POLYGON_RPC_URL}"`);
  console.log(`   POLYGON_CHAIN_ID="${env.POLYGON_CHAIN_ID}"`);
  console.log("");
  console.log("4. Teste o sistema:");
  console.log("   npm run dev");
  console.log("");
  console.log("✅ Pronto! Carteira importada com sucesso!");

  await prisma.$disconnect();
}

importGlobalWallet().catch((error) => {
  console.error("❌ Erro ao importar Global Wallet:", error);
  process.exit(1);
});
