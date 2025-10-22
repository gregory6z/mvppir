import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateTotalUSD } from "@/providers/price/price.provider";

interface GetUserBalanceRequest {
  userId: string;
}

interface TokenBalance {
  tokenSymbol: string;
  tokenAddress: string | null;
  available: Decimal;
  locked: Decimal;
  total: Decimal;
}

interface GetUserBalanceResponse {
  balances: TokenBalance[];
  totalUSD: number;
}

export async function getUserBalance({
  userId,
}: GetUserBalanceRequest): Promise<GetUserBalanceResponse> {
  // Busca saldos da tabela Balance (otimizado)
  const userBalances = await prisma.balance.findMany({
    where: { userId },
    select: {
      tokenSymbol: true,
      tokenAddress: true,
      availableBalance: true,
      lockedBalance: true,
    },
  });

  // Converte para formato de resposta
  const balances: TokenBalance[] = userBalances.map((b) => ({
    tokenSymbol: b.tokenSymbol,
    tokenAddress: b.tokenAddress,
    available: b.availableBalance,
    locked: b.lockedBalance,
    total: b.availableBalance.add(b.lockedBalance),
  }));

  // Calcula total em USD (usa o total = available + locked)
  const balancesByToken: Record<string, number> = {};
  for (const { tokenSymbol, total } of balances) {
    balancesByToken[tokenSymbol] = total.toNumber();
  }

  const totalUSD = await calculateTotalUSD(balancesByToken);

  return { balances, totalUSD };
}
