import { prisma } from "@/lib/prisma";

interface MaticRechargeHistory {
  history: Array<{
    txHash: string;
    amount: string;
    createdAt: string;
    status: "CONFIRMED" | "PENDING";
  }>;
}

/**
 * Retorna histórico de recargas de MATIC na Global Wallet
 */
export async function getMaticRechargeHistory(
  limit: number = 20
): Promise<MaticRechargeHistory> {
  // Buscar Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst();

  if (!globalWallet) {
    throw new Error("GLOBAL_WALLET_NOT_FOUND");
  }

  // Buscar transações de MATIC recebidas pela Global Wallet
  const recharges = await prisma.walletTransaction.findMany({
    where: {
      tokenSymbol: "MATIC",
      depositAddress: {
        polygonAddress: globalWallet.polygonAddress,
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const history = recharges.map((tx) => ({
    txHash: tx.txHash,
    amount: tx.amount.toString(),
    createdAt: tx.createdAt.toISOString(),
    status: tx.status === "CONFIRMED" ? ("CONFIRMED" as const) : ("PENDING" as const),
  }));

  return { history };
}
