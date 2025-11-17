import { prisma } from "@/lib/prisma";
import { updateUserBlockedBalance } from "@/modules/mlm/helpers/update-blocked-balance";

interface RejectWithdrawalRequest {
  withdrawalId: string;
  adminId: string;
  reason: string;
}

/**
 * Admin rejeita saque
 *
 * Fluxo:
 * 1. Valida status PENDING_APPROVAL
 * 2. Atualiza para REJECTED
 * 3. Devolve saldo: lockedBalance → availableBalance
 * 4. Cria notificação para usuário com motivo
 * 5. Loga ação do admin
 */
export async function rejectWithdrawal({
  withdrawalId,
  adminId,
  reason,
}: RejectWithdrawalRequest) {
  // 1. Busca withdrawal
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
    include: { user: true },
  });

  if (!withdrawal) {
    throw new Error("WITHDRAWAL_NOT_FOUND");
  }

  if (withdrawal.status !== "PENDING_APPROVAL") {
    throw new Error(`INVALID_STATUS_${withdrawal.status}`);
  }

  // 2. Atomicamente: rejeita + devolve saldo + notifica
  const rejected = await prisma.$transaction(async (tx) => {
    // Atualiza withdrawal
    const updated = await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "REJECTED",
        rejectedReason: reason,
        updatedAt: new Date(),
      },
    });

    // Devolve saldo: lockedBalance → availableBalance
    await tx.balance.update({
      where: {
        userId_tokenSymbol: {
          userId: withdrawal.userId,
          tokenSymbol: withdrawal.tokenSymbol,
        },
      },
      data: {
        availableBalance: { increment: withdrawal.amount },
        lockedBalance: { decrement: withdrawal.amount },
      },
    });

    // Atualiza User.blockedBalance se for USDC/USDT
    if (withdrawal.tokenSymbol === "USDC" || withdrawal.tokenSymbol === "USDT") {
      await updateUserBlockedBalance(withdrawal.userId, tx);
    }

    // Cria notificação
    await tx.withdrawalNotification.create({
      data: {
        userId: withdrawal.userId,
        withdrawalId,
        type: "WITHDRAWAL_REJECTED",
        title: "Saque Rejeitado",
        message: `Seu saque de ${withdrawal.amount.toString()} ${withdrawal.tokenSymbol} foi rejeitado. Motivo: ${reason}`,
        data: {
          amount: withdrawal.amount.toString(),
          tokenSymbol: withdrawal.tokenSymbol,
          reason,
        },
      },
    });

    // Loga ação do admin
    await tx.adminLog.create({
      data: {
        adminId,
        action: "REJECT_WITHDRAWAL",
        entityId: withdrawalId,
        details: {
          userId: withdrawal.userId,
          amount: withdrawal.amount.toString(),
          tokenSymbol: withdrawal.tokenSymbol,
          reason,
        },
      },
    });

    return updated;
  });

  return {
    withdrawal: rejected,
    notificationSent: true,
    message: "Withdrawal rejected and user notified",
  };
}
