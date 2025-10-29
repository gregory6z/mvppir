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
  monthlyYieldPercentage: number; // Rendimento mensal em % (comissões do mês / depósitos totais)
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

  // Calcular rendimento mensal (comissões do mês atual / depósitos totais)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Soma comissões do mês atual
  const currentMonthCommissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      createdAt: {
        gte: new Date(currentYear, currentMonth, 1), // Primeiro dia do mês
        lt: new Date(currentYear, currentMonth + 1, 1), // Primeiro dia do próximo mês
      },
    },
    _sum: {
      finalAmount: true,
    },
  });

  // Soma depósitos confirmados (tipo CREDIT com status CONFIRMED)
  const totalDeposits = await prisma.walletTransaction.aggregate({
    where: {
      userId,
      type: "CREDIT",
      status: "CONFIRMED",
    },
    _sum: {
      amount: true,
    },
  });

  const commissionsSum = currentMonthCommissions._sum.finalAmount?.toNumber() || 0;
  const depositsSum = totalDeposits._sum.amount?.toNumber() || 0;

  // Calcula percentual: (comissões / depósitos) * 100
  const monthlyYieldPercentage = depositsSum > 0 ? (commissionsSum / depositsSum) * 100 : 0;

  console.log(`📊 Monthly yield calculation for user ${userId}:`);
  console.log(`   Current month commissions: $${commissionsSum.toFixed(2)}`);
  console.log(`   Total deposits: $${depositsSum.toFixed(2)}`);
  console.log(`   Monthly yield: ${monthlyYieldPercentage.toFixed(2)}%`);

  return { balances, totalUSD, monthlyYieldPercentage };
}
