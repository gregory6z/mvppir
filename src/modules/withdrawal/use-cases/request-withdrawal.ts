import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateTotalUSD } from "@/providers/price/price.provider";

interface RequestWithdrawalRequest {
  userId: string;
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: Decimal;
  destinationAddress: string;
}

const WITHDRAWAL_MIN_USD = Number(process.env.WITHDRAWAL_MIN_USD) || 500;
const WITHDRAWAL_FEE_USD = Number(process.env.WITHDRAWAL_FEE_USD) || 5;

/**
 * Usuário solicita saque
 *
 * Validações:
 * - Saldo disponível suficiente
 * - Valor mínimo ($500 USD)
 * - Apenas 1 saque pendente por vez
 *
 * Ações:
 * - Move saldo de availableBalance → lockedBalance
 * - Cria Withdrawal com status PENDING_APPROVAL
 */
export async function requestWithdrawal({
  userId,
  tokenSymbol,
  tokenAddress,
  amount,
  destinationAddress,
}: RequestWithdrawalRequest) {
  // 1. Valida endereço de destino (básico)
  if (!destinationAddress.startsWith("0x") || destinationAddress.length !== 42) {
    throw new Error("INVALID_DESTINATION_ADDRESS");
  }

  // 2. Busca saldo atual
  const balance = await prisma.balance.findUnique({
    where: {
      userId_tokenSymbol: { userId, tokenSymbol },
    },
  });

  if (!balance || balance.availableBalance.lt(amount)) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  // 3. Valida valor mínimo em USD
  const amountUSD = await calculateTotalUSD({
    [tokenSymbol]: amount.toNumber(),
  });

  if (amountUSD < WITHDRAWAL_MIN_USD) {
    throw new Error(`MINIMUM_WITHDRAWAL_${WITHDRAWAL_MIN_USD}_USD`);
  }

  // 4. Verifica se já tem saque pendente
  const pendingWithdrawal = await prisma.withdrawal.findFirst({
    where: {
      userId,
      status: { in: ["PENDING_APPROVAL", "APPROVED", "PROCESSING"] },
    },
  });

  if (pendingWithdrawal) {
    throw new Error("WITHDRAWAL_ALREADY_PENDING");
  }

  // 5. Calcula taxa (fixo em USD, convertido para o token)
  const feeUSD = WITHDRAWAL_FEE_USD;
  const fee = new Decimal(feeUSD); // Simplificado: deveria converter USD → token

  // 6. Atomicamente: move saldo + cria withdrawal
  const withdrawal = await prisma.$transaction(async (tx) => {
    // Move de availableBalance → lockedBalance
    // Nota: updateMany não suporta composite keys diretamente, então usamos AND
    const updated = await tx.balance.updateMany({
      where: {
        userId,
        tokenSymbol,
        availableBalance: { gte: amount }, // Garante que tem saldo (race condition protection)
      },
      data: {
        availableBalance: { decrement: amount },
        lockedBalance: { increment: amount },
      },
    });

    if (updated.count === 0) {
      throw new Error("INSUFFICIENT_BALANCE"); // Race condition detectada
    }

    // Cria withdrawal
    return await tx.withdrawal.create({
      data: {
        userId,
        tokenSymbol,
        tokenAddress,
        amount,
        destinationAddress: destinationAddress.toLowerCase(),
        fee,
        status: "PENDING_APPROVAL",
      },
    });
  });

  return {
    withdrawal,
    message: "Withdrawal request created successfully. Awaiting admin approval.",
  };
}
