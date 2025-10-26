import { prisma } from "@/lib/prisma";
import type { BatchCollect } from "@prisma/client";

interface BatchCollectHistory {
  history: Array<{
    id: string;
    createdAt: string;
    tokenSymbol: string;
    totalCollected: string;
    walletsCount: number;
    status: "COMPLETED" | "FAILED" | "PARTIAL";
    txHashes: string[];
    executedBy?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

/**
 * Retorna histórico de batch collects executados
 *
 * Agora utiliza a tabela batch_collects com informações do admin executor
 */
export async function getBatchCollectHistory(
  limit: number = 20
): Promise<BatchCollectHistory> {
  // Buscar registros de batch collects
  const batchCollects = await prisma.batchCollect.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Buscar informações dos admins que executaram (em paralelo)
  const adminIds = [...new Set(batchCollects.map((bc) => bc.executedBy))].filter(
    (id): id is string => typeof id === "string"
  );
  const admins = await prisma.user.findMany({
    where: {
      id: {
        in: adminIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  // Criar mapa de admins para lookup rápido
  const adminMap = new Map(admins.map((admin) => [admin.id, admin]));

  // Mapear para formato de resposta
  const history = batchCollects.map((bc: BatchCollect) => {
    const admin = adminMap.get(bc.executedBy);

    return {
      id: bc.id,
      createdAt: bc.createdAt.toISOString(),
      tokenSymbol: bc.tokenSymbol,
      totalCollected: bc.totalCollected.toString(),
      walletsCount: bc.walletsCount,
      status: bc.status,
      txHashes: bc.txHashes,
      executedBy: admin
        ? {
            id: admin.id,
            name: admin.name,
            email: admin.email,
          }
        : undefined,
    };
  });

  return { history };
}
