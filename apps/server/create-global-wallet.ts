import { Wallet } from "ethers";
import { prisma } from "./src/lib/prisma.js";
import { encryptPrivateKey } from "./src/lib/encryption.js";

async function createGlobalWallet() {
  try {
    // Verificar se já existe uma Global Wallet
    const existing = await prisma.globalWallet.findFirst();

    if (existing) {
      console.log("✅ Global Wallet já existe:");
      console.log(`   Endereço: ${existing.polygonAddress}`);
      return;
    }

    // Criar nova carteira
    const wallet = Wallet.createRandom();
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

    // Salvar no banco
    const globalWallet = await prisma.globalWallet.create({
      data: {
        polygonAddress: wallet.address.toLowerCase(),
        privateKey: encryptedPrivateKey,
      },
    });

    console.log("\n✅ Global Wallet criada com sucesso!");
    console.log(`   Endereço: ${globalWallet.polygonAddress}`);
    console.log(`   ID: ${globalWallet.id}`);
    console.log("\n⚠️  IMPORTANTE: Guarde a chave privada em local seguro!");
    console.log(`   Private Key: ${wallet.privateKey}\n`);
  } catch (error) {
    console.error("❌ Erro ao criar Global Wallet:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createGlobalWallet();
