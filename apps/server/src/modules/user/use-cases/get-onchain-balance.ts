import { prisma } from "@/lib/prisma";
import { getAllOnChainBalances, OnChainBalanceResult } from "@/providers/blockchain/balance.provider";

interface GetOnChainBalanceRequest {
  userId: string;
}

interface GetOnChainBalanceResponse {
  success: boolean;
  data?: OnChainBalanceResult;
  error?: string;
}

/**
 * Busca saldo on-chain do endereço de depósito do usuário
 * Consulta diretamente a blockchain Polygon em vez do banco de dados
 */
export async function getOnChainBalance({
  userId,
}: GetOnChainBalanceRequest): Promise<GetOnChainBalanceResponse> {
  // Busca endereço de depósito do usuário
  const depositAddress = await prisma.depositAddress.findUnique({
    where: { userId },
    select: { polygonAddress: true },
  });

  if (!depositAddress) {
    return {
      success: false,
      error: "User does not have a deposit address yet",
    };
  }

  try {
    console.log(`🔗 Fetching on-chain balance for user ${userId} at address ${depositAddress.polygonAddress}`);

    const onChainBalances = await getAllOnChainBalances(depositAddress.polygonAddress);

    console.log(`✅ On-chain balance fetched successfully:`, {
      address: onChainBalances.address,
      maticBalance: onChainBalances.totalMaticBalance,
      tokenCount: onChainBalances.balances.length,
    });

    return {
      success: true,
      data: onChainBalances,
    };
  } catch (error) {
    console.error(`❌ Error fetching on-chain balance for user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch on-chain balance",
    };
  }
}
