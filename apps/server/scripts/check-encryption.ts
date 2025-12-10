/**
 * Script para verificar se a ENCRYPTION_KEY consegue descriptografar os dados do banco
 *
 * Uso: npx tsx scripts/check-encryption.ts
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const ALGORITHM = "aes-256-gcm";

function decryptPrivateKey(encryptedData: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, "hex");
  const parts = encryptedData.split(":");

  if (parts.length !== 3) {
    throw new Error(`Invalid format: expected 3 parts (iv:authTag:encrypted), got ${parts.length}`);
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

async function main() {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error("❌ ENCRYPTION_KEY não está definida no ambiente");
    process.exit(1);
  }

  console.log("🔑 ENCRYPTION_KEY encontrada:", encryptionKey.substring(0, 8) + "..." + encryptionKey.substring(encryptionKey.length - 8));
  console.log("🔑 Tamanho:", encryptionKey.length, "caracteres (esperado: 64)");

  // 1. Verifica Global Wallet
  console.log("\n📦 Verificando Global Wallet...");
  const globalWallet = await prisma.globalWallet.findFirst();

  if (globalWallet) {
    console.log("   Endereço:", globalWallet.polygonAddress);
    console.log("   PrivateKey (preview):", globalWallet.privateKey.substring(0, 50) + "...");
    console.log("   Formato (partes):", globalWallet.privateKey.split(":").length);

    try {
      const decrypted = decryptPrivateKey(globalWallet.privateKey, encryptionKey);
      console.log("   ✅ Descriptografia OK! Começa com:", decrypted.substring(0, 10) + "...");
    } catch (error) {
      console.log("   ❌ Erro ao descriptografar:", (error as Error).message);
    }
  } else {
    console.log("   ⚠️ Nenhuma Global Wallet encontrada");
  }

  // 2. Verifica DepositAddresses
  console.log("\n📦 Verificando DepositAddresses...");
  const depositAddresses = await prisma.depositAddress.findMany({
    take: 5,
    select: {
      id: true,
      polygonAddress: true,
      privateKey: true,
      userId: true,
    },
  });

  console.log(`   Encontrados: ${depositAddresses.length} endereços (mostrando até 5)`);

  let successCount = 0;
  let failCount = 0;

  for (const addr of depositAddresses) {
    console.log(`\n   --- ${addr.polygonAddress} ---`);
    console.log(`   PrivateKey (preview): ${addr.privateKey.substring(0, 50)}...`);
    console.log(`   Formato (partes): ${addr.privateKey.split(":").length}`);

    try {
      const decrypted = decryptPrivateKey(addr.privateKey, encryptionKey);
      console.log(`   ✅ OK! Começa com: ${decrypted.substring(0, 10)}...`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ ERRO: ${(error as Error).message}`);
      failCount++;
    }
  }

  console.log("\n📊 Resumo:");
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Falha: ${failCount}`);

  if (failCount > 0) {
    console.log("\n⚠️ Alguns endereços não conseguem ser descriptografados.");
    console.log("   Possíveis causas:");
    console.log("   1. Foram criados com outra ENCRYPTION_KEY");
    console.log("   2. Dados corrompidos no banco");
    console.log("   3. Formato diferente do esperado");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
