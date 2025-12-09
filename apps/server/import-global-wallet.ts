import { Wallet } from "ethers";
import { prisma } from "./src/lib/prisma.js";
import { encryptPrivateKey } from "./src/lib/encryption.js";

/**
 * Script para importar uma Global Wallet existente
 *
 * Uso:
 *   PRIVATE_KEY=0x... npx tsx import-global-wallet.ts
 *
 * Ou edite a variável PRIVATE_KEY abaixo (não recomendado para produção)
 */
async function importGlobalWallet() {
  try {
    // Pegar chave privada da variável de ambiente
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      console.error("❌ Erro: PRIVATE_KEY não fornecida");
      console.log("\nUso:");
      console.log("  PRIVATE_KEY=0x... npx tsx import-global-wallet.ts");
      console.log("\nExemplo:");
      console.log("  PRIVATE_KEY=0x1234567890abcdef... npx tsx import-global-wallet.ts");
      process.exit(1);
    }

    // Verificar se já existe uma Global Wallet
    const existing = await prisma.globalWallet.findFirst();

    if (existing) {
      console.log("⚠️  Já existe uma Global Wallet no banco:");
      console.log(`   Endereço: ${existing.polygonAddress}`);
      console.log("\nDeseja substituir? (Isso irá deletar a existente)");
      console.log("Para continuar, rode com a flag --force:");
      console.log("  PRIVATE_KEY=0x... npx tsx import-global-wallet.ts --force");

      if (!process.argv.includes("--force")) {
        process.exit(0);
      }

      // Deletar existente
      await prisma.globalWallet.delete({ where: { id: existing.id } });
      console.log("🗑️  Global Wallet anterior removida");
    }

    // Criar wallet a partir da chave privada
    const wallet = new Wallet(privateKey);
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

    // Salvar no banco
    const globalWallet = await prisma.globalWallet.create({
      data: {
        polygonAddress: wallet.address.toLowerCase(),
        privateKey: encryptedPrivateKey,
      },
    });

    console.log("\n✅ Global Wallet importada com sucesso!");
    console.log(`   Endereço: ${globalWallet.polygonAddress}`);
    console.log(`   ID: ${globalWallet.id}`);
    console.log("\n🔐 Chave privada criptografada e armazenada no banco de dados");
  } catch (error) {
    console.error("❌ Erro ao importar Global Wallet:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importGlobalWallet();
