import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateTotalUSD } from "@/providers/price/price.provider";
import { unblockBalance } from "@/modules/mlm/use-cases/unblock-balance";
import { MLMRank } from "@prisma/client";
import { getRankRequirements } from "@/modules/mlm/mlm-config";
import { updateUserBlockedBalance } from "@/modules/mlm/helpers/update-blocked-balance";

interface RequestWithdrawalRequest {
  userId: string;
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: Decimal;
  destinationAddress: string;
  force?: boolean; // User confirmed rank loss
}

const MIN_BALANCE_TO_WITHDRAW = Number(process.env.MIN_BALANCE_TO_WITHDRAW) || 500;
const WITHDRAWAL_FEE_USD = Number(process.env.WITHDRAWAL_FEE_USD) || 5;

/**
 * Calculate new rank based on blocked balance after unblocking
 */
function calculateRankFromBlockedBalance(blockedBalance: number): MLMRank {
  const ranks: MLMRank[] = ["GOLD", "SILVER", "BRONZE", "RECRUIT"];

  for (const rank of ranks) {
    const config = getRankRequirements(rank);
    if (blockedBalance >= config.minBlockedBalance) {
      return rank;
    }
  }

  return "RECRUIT";
}

/**
 * Usuário solicita saque
 *
 * Validações:
 * - Saldo disponível suficiente (ou disponível + bloqueado para USDC)
 * - Valor mínimo ($500 USD)
 * - Apenas 1 saque pendente por vez
 *
 * Ações:
 * - Se necessário, desbloqueia saldo de blockedBalance → availableBalance (USDC only)
 * - Avisa se haverá perda de rank (requiresConfirmation: true)
 * - Move saldo de availableBalance → lockedBalance
 * - Cria Withdrawal com status PENDING_APPROVAL
 */
export async function requestWithdrawal({
  userId,
  tokenSymbol,
  tokenAddress,
  amount,
  destinationAddress,
  force = false,
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

  if (!balance) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  // 3. Check if needs to unblock balance (USDC only)
  let unblockWarning: {
    requiresConfirmation: true;
    message: string;
    currentRank: MLMRank;
    newRank: MLMRank;
    amountToUnblock: number;
  } | null = null;

  if (balance.availableBalance.lt(amount)) {
    // Not enough available balance
    const deficit = amount.sub(balance.availableBalance);

    // Check if it's USDC and user has blocked balance
    if (tokenSymbol === "USDC") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          blockedBalance: true,
          currentRank: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check if user has enough blocked balance to cover deficit
      if (user.blockedBalance.gte(deficit)) {
        // Calculate new rank after unblocking
        const newBlockedBalance = user.blockedBalance.sub(deficit).toNumber();
        const newRank = calculateRankFromBlockedBalance(newBlockedBalance);
        const willLoseRank = newRank !== user.currentRank;

        // If rank will be lost and user hasn't confirmed, return warning
        if (willLoseRank && !force) {
          return {
            requiresConfirmation: true,
            message: `Withdrawing $${amount.toString()} USDC requires unblocking $${deficit.toString()} from your blocked balance. This will downgrade your rank from ${user.currentRank} to ${newRank}. Are you sure you want to proceed?`,
            currentRank: user.currentRank,
            newRank,
            amountToUnblock: deficit.toNumber(),
          };
        }

        // User confirmed or no rank loss - proceed with unblocking
        console.log(`🔓 Unblocking $${deficit.toString()} USDC for withdrawal...`);
        const unblockResult = await unblockBalance({
          userId,
          amount: deficit.toNumber(),
        });

        console.log(`✅ Unblocked successfully:`, {
          amountUnblocked: unblockResult.amountUnblocked,
          previousRank: unblockResult.previousRank,
          newRank: unblockResult.newRank,
        });

        // Refresh balance after unblocking
        const updatedBalance = await prisma.balance.findUnique({
          where: {
            userId_tokenSymbol: { userId, tokenSymbol },
          },
        });

        if (!updatedBalance || updatedBalance.availableBalance.lt(amount)) {
          throw new Error("INSUFFICIENT_BALANCE_AFTER_UNBLOCK");
        }

        // Continue with withdrawal process below
      } else {
        // Not enough total balance (available + blocked)
        throw new Error("INSUFFICIENT_BALANCE");
      }
    } else {
      // Not USDC or no blocked balance
      throw new Error("INSUFFICIENT_BALANCE");
    }
  }

  // 4. Valida saldo mínimo para poder sacar (precisa TER $500, mas pode sacar tudo)
  const totalBalance = balance.availableBalance.add(balance.lockedBalance);

  if (totalBalance.lt(MIN_BALANCE_TO_WITHDRAW)) {
    throw new Error(`MINIMUM_BALANCE_TO_WITHDRAW_${MIN_BALANCE_TO_WITHDRAW}_USD`);
  }

  // 5. Verifica se já tem saque pendente
  const pendingWithdrawal = await prisma.withdrawal.findFirst({
    where: {
      userId,
      status: { in: ["PENDING_APPROVAL", "APPROVED", "PROCESSING"] },
    },
  });

  if (pendingWithdrawal) {
    throw new Error("WITHDRAWAL_ALREADY_PENDING");
  }

  // 6. Valida limite diário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentRank: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const rankConfig = getRankRequirements(user.currentRank);
  const dailyLimit = rankConfig.withdrawalFee.dailyLimit;

  // Calcula total sacado hoje
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const withdrawalsToday = await prisma.withdrawal.findMany({
    where: {
      userId,
      createdAt: { gte: startOfDay },
      status: { notIn: ["REJECTED", "FAILED"] },
    },
    select: { amount: true },
  });

  const withdrawnToday = withdrawalsToday.reduce(
    (sum, w) => sum + w.amount.toNumber(),
    0
  );

  const remainingToday = dailyLimit - withdrawnToday;

  if (amount.toNumber() > remainingToday) {
    throw new Error(
      `DAILY_LIMIT_EXCEEDED_${dailyLimit}_${remainingToday.toFixed(2)}`
    );
  }

  // 7. Calcula taxa (fixo em USD, convertido para o token)
  const feeUSD = WITHDRAWAL_FEE_USD;
  const fee = new Decimal(feeUSD); // Simplificado: deveria converter USD → token

  // 8. Atomicamente: move saldo + cria withdrawal
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

    // Atualiza User.blockedBalance se for USDC/USDT
    if (tokenSymbol === "USDC" || tokenSymbol === "USDT") {
      await updateUserBlockedBalance(userId, tx);
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
