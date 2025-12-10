import { prisma } from "@/lib/prisma";
import { getGlobalWallet } from "@/modules/wallet/use-cases/get-global-wallet";
import { Contract, parseUnits, formatUnits } from "ethers";
import {
  categorizeWithdrawalError,
  FailureType,
} from "@/modules/withdrawal/use-cases/categorize-withdrawal-error";
import { checkRankAfterBalanceChange } from "@/modules/mlm/use-cases/check-rank-after-balance-change";
import { updateUserBlockedBalance } from "@/modules/mlm/helpers/update-blocked-balance";

interface ProcessWithdrawalRequest {
  withdrawalId: string;
}

// ERC20 ABI mínimo
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

/**
 * Processa saque aprovado - envia transação na blockchain
 *
 * Fluxo:
 * 1. Valida status APPROVED
 * 2. Atualiza para PROCESSING (lock)
 * 3. Envia transação na blockchain
 * 4. Aguarda confirmação
 * 5. Atualiza Withdrawal para COMPLETED
 * 6. Cria WalletTransaction tipo DEBIT
 * 7. Atualiza Balance (decrementa lockedBalance)
 * 8. Notifica usuário
 *
 * Se falhar: atualiza para FAILED e notifica
 */
export async function processWithdrawal({
  withdrawalId,
}: ProcessWithdrawalRequest) {
  console.log(`🔄 Processing withdrawal ${withdrawalId}...`);

  // 1. Busca withdrawal
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("WITHDRAWAL_NOT_FOUND");
  }

  if (withdrawal.status !== "APPROVED") {
    throw new Error(`INVALID_STATUS_${withdrawal.status}`);
  }

  // 2. Atualiza para PROCESSING (previne duplo processamento)
  const updated = await prisma.withdrawal.updateMany({
    where: {
      id: withdrawalId,
      status: "APPROVED",
      processedAt: null, // Garante que não foi processado ainda
    },
    data: {
      status: "PROCESSING",
      processedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    throw new Error("WITHDRAWAL_ALREADY_PROCESSED");
  }

  try {
    // 3. Busca Global Wallet
    const { wallet: globalWallet } = await getGlobalWallet();

    let txHash: string;

    // 4. Envia transação (MATIC nativo ou ERC20 token)
    if (withdrawal.tokenSymbol === "MATIC") {
      // MATIC nativo
      const amountWei = parseUnits(withdrawal.amount.toString(), 18);

      const tx = await globalWallet.sendTransaction({
        to: withdrawal.destinationAddress,
        value: amountWei,
      });

      console.log(`📤 MATIC transfer sent: ${tx.hash}`);

      // Aguarda 1 confirmação
      const receipt = await tx.wait(1);
      txHash = receipt!.hash;

      console.log(`✅ MATIC transfer confirmed: ${txHash}`);
    } else {
      // Token ERC20 (USDC, USDT, etc)
      if (!withdrawal.tokenAddress) {
        throw new Error("TOKEN_ADDRESS_REQUIRED_FOR_ERC20");
      }

      const tokenContract = new Contract(
        withdrawal.tokenAddress,
        ERC20_ABI,
        globalWallet
      );

      // Busca decimals do token
      const decimals = await tokenContract.decimals();
      const amountRaw = parseUnits(withdrawal.amount.toString(), decimals);

      // Envia transfer
      const tx = await tokenContract.transfer(
        withdrawal.destinationAddress,
        amountRaw
      );

      console.log(`📤 ${withdrawal.tokenSymbol} transfer sent: ${tx.hash}`);

      // Aguarda 1 confirmação
      const receipt = await tx.wait(1);
      txHash = receipt!.hash;

      console.log(
        `✅ ${withdrawal.tokenSymbol} transfer confirmed: ${txHash}`
      );
    }

    // 5. Atomicamente: atualiza Withdrawal + cria WalletTransaction + atualiza Balance + notifica
    await prisma.$transaction(async (tx) => {
      // Atualiza Withdrawal para COMPLETED
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "COMPLETED",
          txHash,
        },
      });

      // Verifica se já existe WalletTransaction com esse txHash
      // (pode acontecer se o destinatário for um DepositAddress monitorado pelo Moralis)
      const existingTx = await tx.walletTransaction.findUnique({
        where: { txHash },
      });

      if (!existingTx) {
        // Cria WalletTransaction tipo DEBIT (histórico)
        await tx.walletTransaction.create({
          data: {
            userId: withdrawal.userId,
            depositAddressId: "", // TODO: buscar depositAddressId do usuário
            type: "DEBIT",
            tokenSymbol: withdrawal.tokenSymbol,
            tokenAddress: withdrawal.tokenAddress,
            tokenDecimals: withdrawal.tokenSymbol === "MATIC" ? 18 : 6, // TODO: buscar do contrato
            amount: withdrawal.amount,
            rawAmount: parseUnits(
              withdrawal.amount.toString(),
              withdrawal.tokenSymbol === "MATIC" ? 18 : 6
            ).toString(),
            txHash,
            status: "CONFIRMED",
          },
        });
      } else {
        console.log(`⚠️ WalletTransaction already exists for txHash ${txHash}, skipping creation`);
      }

      // Atualiza Balance (decrementa lockedBalance)
      await tx.balance.update({
        where: {
          userId_tokenSymbol: {
            userId: withdrawal.userId,
            tokenSymbol: withdrawal.tokenSymbol,
          },
        },
        data: {
          lockedBalance: { decrement: withdrawal.amount },
        },
      });

      // Atualiza User.blockedBalance se for USDC/USDT
      if (withdrawal.tokenSymbol === "USDC" || withdrawal.tokenSymbol === "USDT") {
        await updateUserBlockedBalance(withdrawal.userId, tx);
      }

      // Cria notificação de conclusão
      await tx.withdrawalNotification.create({
        data: {
          userId: withdrawal.userId,
          withdrawalId,
          type: "WITHDRAWAL_COMPLETED",
          title: "Saque Concluído!",
          message: `Seu saque de ${withdrawal.amount.toString()} ${withdrawal.tokenSymbol} foi processado com sucesso. TxHash: ${txHash}`,
          data: {
            amount: withdrawal.amount.toString(),
            tokenSymbol: withdrawal.tokenSymbol,
            txHash,
            destinationAddress: withdrawal.destinationAddress,
          },
        },
      });
    });

    console.log(`✅ Withdrawal ${withdrawalId} completed successfully`);

    // Check if user's rank needs to be downgraded after withdrawal
    // (only for USDC withdrawals that affect blockedBalance)
    if (withdrawal.tokenSymbol === "USDC") {
      const rankCheck = await checkRankAfterBalanceChange({
        userId: withdrawal.userId,
      });

      if (rankCheck.rankChanged) {
        console.log(
          `⬇️  User rank changed after withdrawal: ${rankCheck.previousRank} → ${rankCheck.newRank}`
        );

        // Create additional notification about rank change
        await prisma.withdrawalNotification.create({
          data: {
            userId: withdrawal.userId,
            withdrawalId,
            type: "WITHDRAWAL_COMPLETED",
            title: "Atenção: Graduação Alterada",
            message: `Devido ao saque, sua graduação foi alterada de ${rankCheck.previousRank} para ${rankCheck.newRank}. Mantenha seu saldo investido para recuperar sua graduação anterior.`,
            data: {
              previousRank: rankCheck.previousRank,
              newRank: rankCheck.newRank,
              reason: rankCheck.reason,
            },
          },
        });
      }
    }

    return {
      success: true,
      txHash,
    };
  } catch (error) {
    // Categoriza erro: RECOVERABLE (sem gas/saldo) ou PERMANENT (endereço inválido, etc)
    const failureType = categorizeWithdrawalError(
      error instanceof Error ? error : new Error(String(error))
    );

    console.error(
      `❌ Failed to process withdrawal ${withdrawalId} (${failureType}):`,
      error
    );

    await prisma.$transaction(async (tx) => {
      // Atualiza Withdrawal para FAILED com motivo
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "FAILED",
          rejectedReason: `${failureType}: ${error instanceof Error ? error.message : String(error)}`,
        },
      });

      // ✅ APENAS devolve saldo se erro for PERMANENTE
      // Se RECOVERABLE, saldo fica locked (admin pode fazer retry)
      if (failureType === FailureType.PERMANENT) {
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
      }

      // Cria notificação adequada ao tipo de erro
      await tx.withdrawalNotification.create({
        data: {
          userId: withdrawal.userId,
          withdrawalId,
          type: "WITHDRAWAL_FAILED",
          title:
            failureType === FailureType.RECOVERABLE
              ? "Saque Temporariamente Falhou"
              : "Saque Cancelado",
          message:
            failureType === FailureType.RECOVERABLE
              ? `Seu saque de ${withdrawal.amount.toString()} ${withdrawal.tokenSymbol} falhou temporariamente. O administrador irá tentar novamente. Motivo: ${error instanceof Error ? error.message : "Unknown error"}`
              : `Seu saque de ${withdrawal.amount.toString()} ${withdrawal.tokenSymbol} foi cancelado permanentemente. O saldo foi devolvido para sua conta. Motivo: ${error instanceof Error ? error.message : "Unknown error"}`,
          data: {
            amount: withdrawal.amount.toString(),
            tokenSymbol: withdrawal.tokenSymbol,
            failureType,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      });
    });

    throw error;
  }
}
