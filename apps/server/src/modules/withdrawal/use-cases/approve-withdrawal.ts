import { prisma } from "@/lib/prisma";
import { processWithdrawal } from "@/modules/withdrawal/use-cases/process-withdrawal";
import { env } from "@/config/env";

interface ApproveWithdrawalRequest {
  withdrawalId: string;
  adminId: string;
}

/**
 * Admin aprova saque
 *
 * Fluxo:
 * 1. Valida status PENDING_APPROVAL
 * 2. Atualiza para APPROVED
 * 3. Registra approvedBy e approvedAt
 * 4. Cria notificação para usuário
 * 5. Loga ação do admin
 * 6. Processa saque automaticamente
 */
export async function approveWithdrawal({
  withdrawalId,
  adminId,
}: ApproveWithdrawalRequest) {
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

  // 2. Atualiza para APPROVED atomicamente
  const approved = await prisma.$transaction(async (tx) => {
    // Atualiza withdrawal
    const updated = await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "APPROVED",
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    // Cria notificação
    await tx.withdrawalNotification.create({
      data: {
        userId: withdrawal.userId,
        withdrawalId,
        type: "WITHDRAWAL_APPROVED",
        title: "Saque Aprovado!",
        message: `Seu saque de ${withdrawal.amount.toString()} ${withdrawal.tokenSymbol} foi aprovado pelo administrador e está sendo processado.`,
        data: {
          amount: withdrawal.amount.toString(),
          tokenSymbol: withdrawal.tokenSymbol,
          destinationAddress: withdrawal.destinationAddress,
        },
      },
    });

    // Loga ação do admin
    await tx.adminLog.create({
      data: {
        adminId,
        action: "APPROVE_WITHDRAWAL",
        entityId: withdrawalId,
        details: {
          userId: withdrawal.userId,
          amount: withdrawal.amount.toString(),
          tokenSymbol: withdrawal.tokenSymbol,
          destinationAddress: withdrawal.destinationAddress,
        },
      },
    });

    return updated;
  });

  // 3. Processa saque automaticamente em background (se não estiver em modo de teste)
  // IMPORTANTE: processWithdrawal é async mas não aguardamos para não travar a resposta ao admin
  if (!env.SKIP_BLOCKCHAIN_PROCESSING) {
    processWithdrawal({ withdrawalId })
      .then(() => {
        console.log(`✅ Withdrawal ${withdrawalId} processed successfully`);
      })
      .catch((error) => {
        console.error(`❌ Failed to process withdrawal ${withdrawalId}:`, error);
        // Em caso de erro, o saque fica como APPROVED mas não processado
        // Admin pode tentar reprocessar manualmente ou será retried automaticamente
      });
  } else {
    console.log(`⚠️ Blockchain processing skipped for withdrawal ${withdrawalId} (test mode)`);
  }

  return {
    withdrawal: approved,
    notificationSent: true,
    message: "Withdrawal approved and processing started",
  };
}
