import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import type { PrismaClient } from "@prisma/client";

/**
 * Atualiza User.blockedBalance com base em DEPÓSITOS - SAQUES (investimento líquido)
 *
 * blockedBalance representa o investimento real do usuário, não saldo total.
 * Comissões NÃO contam como investimento.
 *
 * Fórmula: blockedBalance = Depósitos CONFIRMADOS - Saques COMPLETADOS
 *
 * Esta função deve ser chamada sempre que houver:
 * - Depósito confirmado (CREDIT)
 * - Saque completado (DEBIT)
 *
 * @param userId - ID do usuário
 * @param tx - Transação Prisma (opcional, se estiver dentro de uma transação)
 */
export async function updateUserBlockedBalance(
  userId: string,
  tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
) {
  const prismaClient = tx || prisma;

  // Soma todos os depósitos CONFIRMADOS (USDC + USDT)
  const deposits = await prismaClient.walletTransaction.aggregate({
    where: {
      userId,
      type: "CREDIT",
      status: "CONFIRMED",
      tokenSymbol: { in: ["USDC", "USDT"] },
    },
    _sum: {
      amount: true,
    },
  });

  // Soma todos os saques COMPLETADOS (USDC + USDT)
  const withdrawals = await prismaClient.walletTransaction.aggregate({
    where: {
      userId,
      type: "DEBIT",
      status: "CONFIRMED",
      tokenSymbol: { in: ["USDC", "USDT"] },
    },
    _sum: {
      amount: true,
    },
  });

  const totalDeposits = deposits._sum.amount || new Decimal(0);
  const totalWithdrawals = withdrawals._sum.amount || new Decimal(0);

  // blockedBalance = depósitos - saques (investimento líquido)
  const blockedBalance = totalDeposits.sub(totalWithdrawals);

  // Atualiza User.blockedBalance
  await prismaClient.user.update({
    where: { id: userId },
    data: { blockedBalance },
  });

  console.log(`💰 User.blockedBalance atualizado: ${blockedBalance.toString()} (depósitos: ${totalDeposits.toString()}, saques: ${totalWithdrawals.toString()})`);

  return blockedBalance;
}
