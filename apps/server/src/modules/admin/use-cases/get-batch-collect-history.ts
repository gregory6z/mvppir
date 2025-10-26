import { prisma } from "@/lib/prisma";

interface BatchCollectHistory {
  history: Array<{
    id: string;
    createdAt: string;
    tokenSymbol: string;
    totalCollected: string;
    walletsCount: number;
    status: "COMPLETED" | "FAILED" | "PARTIAL";
    txHashes: string[];
  }>;
}

/**
 * Retorna histórico de batch collects executados
 *
 * NOTA: Usa WalletTransactions com status SENT_TO_GLOBAL como aproximação
 * TODO: Quando criar tabela batch_collect_logs, usar ela como fonte
 */
export async function getBatchCollectHistory(
  limit: number = 20
): Promise<BatchCollectHistory> {
  // Buscar transações que foram transferidas para global
  const sentToGlobalTxs = await prisma.walletTransaction.findMany({
    where: {
      status: "SENT_TO_GLOBAL",
    },
    orderBy: { createdAt: "desc" },
    take: limit * 10, // Pegar mais para agrupar
  });

  // Agrupar por data + token (aproximação de batch collects)
  const grouped = sentToGlobalTxs.reduce((acc, tx) => {
    const dateKey = tx.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
    const key = `${dateKey}-${tx.tokenSymbol}`;

    if (!acc[key]) {
      acc[key] = {
        id: key,
        createdAt: tx.createdAt.toISOString(),
        tokenSymbol: tx.tokenSymbol,
        totalCollected: 0,
        walletsCount: new Set<string>(),
        status: "COMPLETED" as const,
        txHashes: [] as string[],
      };
    }

    acc[key].totalCollected += Number(tx.amount);
    acc[key].walletsCount.add(tx.userId);
    if (tx.transferTxHash) {
      acc[key].txHashes.push(tx.transferTxHash);
    }

    return acc;
  }, {} as Record<string, any>);

  // Converter para array e pegar apenas o limit solicitado
  const history = Object.values(grouped)
    .map((entry) => ({
      ...entry,
      walletsCount: entry.walletsCount.size,
      totalCollected: entry.totalCollected.toFixed(8),
    }))
    .slice(0, limit);

  return { history };
}
