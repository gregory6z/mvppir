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
  blocked: Decimal; // Blocked for rank (only for USDC)
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

  // Busca blockedBalance do usuário (apenas para USDC)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      blockedBalance: true,
    },
  });

  const blockedBalance = user?.blockedBalance || new Decimal(0);

  // Converte para formato de resposta
  // NOTA: Balance.availableBalance já inclui comissões creditadas pelo worker
  // Não é necessário somar comissões novamente (evita duplicação)
  const balances: TokenBalance[] = userBalances.map((b) => {
    // Apenas USDC tem blockedBalance
    const blocked = b.tokenSymbol === "USDC" ? blockedBalance : new Decimal(0);

    return {
      tokenSymbol: b.tokenSymbol,
      tokenAddress: b.tokenAddress,
      available: b.availableBalance, // Já inclui comissões creditadas
      locked: b.lockedBalance,
      blocked,
      // Total = available + locked (blocked não soma para evitar duplicação)
      total: b.availableBalance.add(b.lockedBalance),
    };
  });

  // Calcula total em USD (usa o total = available + locked + blocked)
  const balancesByToken: Record<string, number> = {};
  for (const { tokenSymbol, total } of balances) {
    balancesByToken[tokenSymbol] = total.toNumber();
  }

  const totalUSD = await calculateTotalUSD(balancesByToken);

  // Calcular rendimento mensal (comissões do mês atual / depósitos totais)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Soma comissões do mês atual (usa paidAt, que é quando foram creditadas)
  const currentMonthCommissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      paidAt: {
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
