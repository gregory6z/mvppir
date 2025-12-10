import { prisma } from "@/lib/prisma";
import { decryptPrivateKey } from "@/lib/encryption";
import { Wallet, JsonRpcProvider, FetchRequest } from "ethers";

// Cache do provider para reutilizar conexão
let cachedProvider: JsonRpcProvider | null = null;

/**
 * Cria ou reutiliza provider com timeout otimizado
 */
function getPolygonProvider(): JsonRpcProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  // Cria FetchRequest com timeout de 15 segundos (ao invés do padrão de 300s)
  const fetchRequest = new FetchRequest(process.env.POLYGON_RPC_URL!);
  fetchRequest.timeout = 15000; // 15 segundos

  cachedProvider = new JsonRpcProvider(fetchRequest, undefined, {
    staticNetwork: true, // Evita chamada getNetwork() a cada request
    batchMaxCount: 1, // Desabilita batching para envio mais rápido
  });

  return cachedProvider;
}

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

  // 3. Cria instância do Wallet conectada ao Polygon (reutiliza provider)
  const provider = getPolygonProvider();
  const wallet = new Wallet(privateKey, provider);

  return {
    id: globalWallet.id,
    address: globalWallet.polygonAddress,
    wallet, // Instância pronta para enviar transações
  };
}
