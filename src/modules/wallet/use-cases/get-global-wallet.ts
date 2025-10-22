import { prisma } from "@/lib/prisma";
import { decryptPrivateKey } from "@/lib/encryption";
import { Wallet, JsonRpcProvider } from "ethers";

/**
 * Busca Global Wallet do banco e retorna instância do Wallet pronta para usar
 */
export async function getGlobalWallet() {
  // 1. Busca do banco
  const globalWallet = await prisma.globalWallet.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!globalWallet) {
    throw new Error("GLOBAL_WALLET_NOT_FOUND");
  }

  // 2. Descriptografa private key
  const privateKey = decryptPrivateKey(globalWallet.privateKey);

  // 3. Cria instância do Wallet conectada ao Polygon
  const provider = new JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet = new Wallet(privateKey, provider);

  return {
    id: globalWallet.id,
    address: globalWallet.polygonAddress,
    wallet, // Instância pronta para enviar transações
  };
}
