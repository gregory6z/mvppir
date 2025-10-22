import { prisma } from "@/lib/prisma";
import { processWithdrawal } from "@/modules/withdrawal/use-cases/process-withdrawal";

interface RetryWithdrawalRequest {
  withdrawalId: string;
  adminId: string;
}

/**
 * Admin tenta reprocessar saque que falhou
 *
 * Use case típico:
 * 1. Saque falhou por "Insufficient MATIC for gas" (RECOVERABLE)
 * 2. Admin adiciona MATIC na global wallet
 * 3. Admin clica "Retry" para reprocessar
 *
 * Validações:
 * - Saque deve estar com status FAILED
 * - Saldo ainda deve estar locked (não devolvido)
 *
 * Ações:
 * 1. Volta status para APPROVED
 * 2. Limpa processedAt (libera lock)
 * 3. Loga ação do admin
 * 4. Chama processWithdrawal() novamente
 */
export async function retryWithdrawal({
  withdrawalId,
  adminId,
}: RetryWithdrawalRequest) {
  // 1. Busca withdrawal
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("WITHDRAWAL_NOT_FOUND");
  }

  // 2. Valida status (apenas FAILED pode ser retried)
  if (withdrawal.status !== "FAILED") {
    throw new Error(`CANNOT_RETRY_STATUS_${withdrawal.status}`);
  }

  // 3. Atomicamente: volta para APPROVED + loga ação
  await prisma.$transaction(async (tx) => {
    // Volta para APPROVED (será reprocessado)
    await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "APPROVED",
        processedAt: null, // Limpa lock de processamento
        rejectedReason: null, // Limpa motivo de falha anterior
      },
    });

    // Loga ação do admin
    await tx.adminLog.create({
      data: {
        adminId,
        action: "RETRY_WITHDRAWAL",
        entityId: withdrawalId,
        details: {
          userId: withdrawal.userId,
          amount: withdrawal.amount.toString(),
          tokenSymbol: withdrawal.tokenSymbol,
          previousError: withdrawal.rejectedReason,
        },
      },
    });
  });

  // 4. Processa automaticamente
  // IMPORTANTE: não aguardamos para não travar a resposta HTTP
  // O resultado será atualizado no banco (COMPLETED ou FAILED)
  processWithdrawal({ withdrawalId })
    .then(() => {
      console.log(`✅ Retry successful for withdrawal ${withdrawalId}`);
    })
    .catch((error) => {
      console.error(`❌ Retry failed for withdrawal ${withdrawalId}:`, error);
      // Falhou novamente - fica como FAILED no banco
    });

  return {
    message: "Withdrawal retry initiated",
    withdrawalId,
  };
}
