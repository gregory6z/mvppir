import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import type { PrismaClient } from "@prisma/client";

/**
 * Atualiza User.blockedBalance com base no saldo disponível de USDC + USDT
 *
 * Esta função deve ser chamada sempre que Balance.availableBalance mudar para USDC ou USDT:
 * - Após depósito confirmado
 * - Após saque solicitado (move para lockedBalance)
 * - Após saque rejeitado (devolve para availableBalance)
 * - Após saque completado (remove de lockedBalance)
 * - Após saque falhou permanente (devolve para availableBalance)
 *
 * @param userId - ID do usuário
 * @param tx - Transação Prisma (opcional, se estiver dentro de uma transação)
 */
export async function updateUserBlockedBalance(
  userId: string,
  tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
) {
  const prismaClient = tx || prisma;

  // Busca saldo disponível de USDC + USDT
  const balances = await prismaClient.balance.findMany({
    where: {
      userId,
      tokenSymbol: { in: ["USDC", "USDT"] },
    },
    select: {
      availableBalance: true,
    },
  });

  // Calcula total disponível
  const totalAvailable = balances.reduce(
    (sum, balance) => sum.add(balance.availableBalance),
    new Decimal(0)
  );

  // Atualiza User.blockedBalance
  await prismaClient.user.update({
    where: { id: userId },
    data: { blockedBalance: totalAvailable },
  });

  console.log(`💰 User.blockedBalance atualizado: ${totalAvailable.toString()} (USDC + USDT disponível)`);

  return totalAvailable;
}
