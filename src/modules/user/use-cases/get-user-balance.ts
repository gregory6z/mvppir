import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

interface GetUserBalanceRequest {
  userId: string;
}

interface TokenBalance {
  tokenSymbol: string;
  tokenAddress: string | null;
  balance: Decimal;
}

interface GetUserBalanceResponse {
  balances: TokenBalance[];
}

export async function getUserBalance({
  userId,
}: GetUserBalanceRequest): Promise<GetUserBalanceResponse> {
  // Busca todas as transações CONFIRMADAS do usuário
  // CONFIRMED = blockchain confirmou, dinheiro na carteira individual
  // SENT_TO_GLOBAL = já movido para a carteira global
  // NÃO inclui PENDING (ainda aguardando confirmação da blockchain)
  const transactions = await prisma.walletTransaction.findMany({
    where: {
      userId,
      status: {
        in: ["CONFIRMED", "SENT_TO_GLOBAL"]
      }
    },
    select: {
      tokenSymbol: true,
      tokenAddress: true,
      amount: true,
      type: true,
    },
  });

  // Agrupa por token e calcula saldo
  const balanceMap = new Map<string, { tokenAddress: string | null; balance: Decimal }>();

  for (const tx of transactions) {
    const key = tx.tokenSymbol;
    const current = balanceMap.get(key) || { tokenAddress: tx.tokenAddress, balance: new Decimal(0) };

    if (tx.type === "CREDIT") {
      current.balance = current.balance.add(tx.amount);
    } else {
      current.balance = current.balance.sub(tx.amount);
    }

    balanceMap.set(key, current);
  }

  // Converte para array
  const balances: TokenBalance[] = Array.from(balanceMap.entries()).map(
    ([tokenSymbol, { tokenAddress, balance }]) => ({
      tokenSymbol,
      tokenAddress,
      balance,
    })
  );

  return { balances };
}
