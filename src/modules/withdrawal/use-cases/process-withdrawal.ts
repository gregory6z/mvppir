import { prisma } from "@/lib/prisma";
import { getGlobalWallet } from "@/modules/wallet/use-cases/get-global-wallet";
import { Contract, parseUnits, formatUnits } from "ethers";

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

    return {
      success: true,
      txHash,
    };
  } catch (error) {
    // Em caso de erro, marca como FAILED e notifica
    console.error(`❌ Failed to process withdrawal ${withdrawalId}:`, error);

    await prisma.$transaction(async (tx) => {
      // Atualiza Withdrawal para FAILED
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "FAILED",
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

      // Cria notificação de falha
      await tx.withdrawalNotification.create({
        data: {
          userId: withdrawal.userId,
          withdrawalId,
          type: "WITHDRAWAL_FAILED",
          title: "Saque Falhou",
          message: `Seu saque de ${withdrawal.amount.toString()} ${withdrawal.tokenSymbol} falhou durante o processamento. O saldo foi devolvido para sua conta.`,
          data: {
            amount: withdrawal.amount.toString(),
            tokenSymbol: withdrawal.tokenSymbol,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      });
    });

    throw error;
  }
}
