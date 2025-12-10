import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { checkAccountActivation } from "@/modules/user/use-cases/check-account-activation";
import { autoCheckAndPromote } from "@/modules/mlm/use-cases/check-rank-progression";
import { autoBlockBalance } from "@/modules/mlm/use-cases/auto-block-balance";
import { updateNetworkVolume } from "@/modules/mlm/use-cases/update-network-volume";
import { identifyToken, KNOWN_TOKENS } from "@/lib/tokens";
import { updateUserBlockedBalance } from "@/modules/mlm/helpers/update-blocked-balance";

/**
 * Deposit payload structure
 * Used by both WebSocket listener and legacy webhook integrations
 */
interface DepositPayload {
  confirmed: boolean;
  chainId: string;
  txHash: string;
  to: string;
  from: string;
  value: string;
  tokenAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: string;
  block: {
    number: string;
    timestamp: string;
  };
}

interface ProcessDepositRequest {
  payload: DepositPayload;
}

/**
 * Process a blockchain deposit
 *
 * This is the core business logic for processing deposits detected
 * by the blockchain WebSocket listener.
 */
export async function processDeposit({
  payload,
}: ProcessDepositRequest) {
  // Validações iniciais
  if (!payload.txHash) {
    throw new Error("INVALID_PAYLOAD: txHash missing");
  }

  if (!payload.to) {
    throw new Error("INVALID_PAYLOAD: recipient address missing");
  }

  if (!payload.value || payload.value === "0") {
    console.warn("[Deposit] Zero value transaction ignored:", payload.txHash);
    return { message: "Zero value transaction ignored", txHash: payload.txHash };
  }

  // Verifica se a transação já existe
  const existingTx = await prisma.walletTransaction.findUnique({
    where: { txHash: payload.txHash },
  });

  // Se já existe e está confirmada, ignora
  if (existingTx && existingTx.status === "CONFIRMED") {
    console.log(`[Deposit] Transaction already confirmed: ${payload.txHash}`);
    return { message: "Transaction already confirmed", txHash: payload.txHash };
  }

  // Se existe como PENDING e agora está confirmed = true, atualiza para CONFIRMED
  if (existingTx && existingTx.status === "PENDING" && payload.confirmed) {
    // Usa transaction para atomicidade
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Atualiza transação
      const updatedTx = await tx.walletTransaction.update({
        where: { txHash: payload.txHash },
        data: { status: "CONFIRMED" },
      });

      // 2. Atualiza/cria saldo (CREDIT = aumenta availableBalance)
      await tx.balance.upsert({
        where: {
          userId_tokenSymbol: {
            userId: existingTx.userId,
            tokenSymbol: existingTx.tokenSymbol,
          },
        },
        create: {
          userId: existingTx.userId,
          tokenSymbol: existingTx.tokenSymbol,
          tokenAddress: existingTx.tokenAddress,
          availableBalance: existingTx.amount,
          lockedBalance: new Decimal(0),
        },
        update: {
          availableBalance: { increment: existingTx.amount },
        },
      });

      // 3. Atualiza User.blockedBalance se for USDC/USDT
      if (existingTx.tokenSymbol === "USDC" || existingTx.tokenSymbol === "USDT") {
        await updateUserBlockedBalance(existingTx.userId, tx);
      }

      return updatedTx;
    });

    console.log(`[Deposit] Transaction confirmed:`, {
      transactionId: updated.id,
      txHash: payload.txHash,
      previousStatus: "PENDING",
      newStatus: "CONFIRMED",
    });

    // Atualiza lifetimeVolume da rede (apenas para USDC/USDT)
    if (existingTx.tokenSymbol === "USDC" || existingTx.tokenSymbol === "USDT") {
      console.log(`[Deposit] Updating network volume for user ${existingTx.userId}`);
      try {
        await updateNetworkVolume({
          userId: existingTx.userId,
          amount: existingTx.amount,
        });
      } catch (error) {
        console.error("[Deposit] CRITICAL ERROR updating network volume:", error);
        throw error;
      }
    }

    // Verifica ativação de conta após confirmação
    try {
      const activationResult = await checkAccountActivation({
        userId: existingTx.userId,
      });

      if (activationResult.activated) {
        console.log(`[Deposit] Account activated! Total: $${activationResult.currentTotalUSD.toFixed(2)} USD`);
      }
    } catch (error) {
      console.error("[Deposit] Error checking account activation:", error);
    }

    // Verifica progressão de rank (MLM)
    try {
      const promoted = await autoCheckAndPromote(existingTx.userId);

      if (promoted) {
        console.log(`[Deposit] User promoted automatically!`);
      }
    } catch (error) {
      console.error("[Deposit] Error checking rank progression:", error);
    }

    // Auto-bloqueia saldo para upgrade de rank (USDC ou USDT)
    if (existingTx.tokenSymbol === "USDC" || existingTx.tokenSymbol === "USDT") {
      try {
        const blockResult = await autoBlockBalance({ userId: existingTx.userId });

        if (blockResult.blocked) {
          console.log(`[Deposit] Balance auto-blocked:`, {
            amountBlocked: blockResult.amountBlocked,
            previousRank: blockResult.previousRank,
            newRank: blockResult.newRank,
          });
        }
      } catch (error) {
        console.error("[Deposit] Error auto-blocking balance:", error);
      }
    }

    return {
      message: "Transaction confirmed",
      transactionId: updated.id,
      status: "CONFIRMED",
    };
  }

  // Se já existe como PENDING mas confirmed ainda é false, ignora (aguarda confirmação)
  if (existingTx && existingTx.status === "PENDING" && !payload.confirmed) {
    console.log(`[Deposit] Transaction still pending: ${payload.txHash}`);
    return { message: "Transaction already pending confirmation", txHash: payload.txHash };
  }

  // Busca o endereço de depósito
  const depositAddress = await prisma.depositAddress.findUnique({
    where: { polygonAddress: payload.to.toLowerCase() },
    include: { user: true },
  });

  if (!depositAddress) {
    console.error(`[Deposit] Deposit address not found: ${payload.to}`);
    throw new Error(`DEPOSIT_ADDRESS_NOT_FOUND: ${payload.to}`);
  }

  // Verifica se o endereço está ativo
  if (depositAddress.status !== "ACTIVE") {
    console.warn(`[Deposit] Deposit to inactive address (${depositAddress.status}):`, payload.to);
    return {
      message: "Deposit address is not active",
      status: depositAddress.status,
      txHash: payload.txHash,
    };
  }

  // Identifica o token recebido (ACEITA QUALQUER TOKEN)
  const token = identifyToken(payload);
  const tokenAddress = payload.tokenAddress?.toLowerCase() || null;
  const rawAmount = payload.value;

  // Log informativo para tokens desconhecidos
  if (token.symbol === "UNKNOWN" || (!KNOWN_TOKENS[tokenAddress as keyof typeof KNOWN_TOKENS] && tokenAddress)) {
    console.log(`[Deposit] Non-standard token detected:`, {
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      address: tokenAddress,
      txHash: payload.txHash,
    });
  }

  // Converte valor raw para decimal usando decimals corretos
  const amount = new Decimal(rawAmount).div(new Decimal(10).pow(token.decimals));

  // Validação de amount mínimo (exemplo: não aceitar micro-transações)
  const MIN_AMOUNT = new Decimal(0.000001);
  if (amount.lt(MIN_AMOUNT)) {
    console.warn(`[Deposit] Value too small ignored: ${amount.toString()} ${token.symbol}`);
    return {
      message: "Transaction value too small",
      amount: amount.toString(),
      txHash: payload.txHash,
    };
  }

  // Determina status inicial baseado na confirmação
  const initialStatus = payload.confirmed ? "CONFIRMED" : "PENDING";

  // Detecta se é transação de teste (txHash começa com "0xt3st4")
  const isTest = payload.txHash.toLowerCase().startsWith("0xt3st4");

  if (isTest) {
    console.log(`[Deposit] TEST transaction detected: ${payload.txHash}`);
  }

  // Cria transação (e atualiza saldo se CONFIRMED)
  const transaction = await prisma.$transaction(async (tx) => {
    // 1. Cria transação
    const newTx = await tx.walletTransaction.create({
      data: {
        userId: depositAddress.userId,
        depositAddressId: depositAddress.id,
        type: "CREDIT",
        tokenSymbol: token.symbol,
        tokenAddress,
        tokenDecimals: token.decimals,
        amount,
        rawAmount,
        txHash: payload.txHash,
        status: initialStatus,
        isTest,
      },
    });

    // 2. Se CONFIRMED, atualiza saldo imediatamente
    if (initialStatus === "CONFIRMED") {
      await tx.balance.upsert({
        where: {
          userId_tokenSymbol: {
            userId: depositAddress.userId,
            tokenSymbol: token.symbol,
          },
        },
        create: {
          userId: depositAddress.userId,
          tokenSymbol: token.symbol,
          tokenAddress,
          availableBalance: amount,
          lockedBalance: new Decimal(0),
        },
        update: {
          availableBalance: { increment: amount },
        },
      });

      // 3. Atualiza User.blockedBalance se for USDC/USDT
      if (token.symbol === "USDC" || token.symbol === "USDT") {
        await updateUserBlockedBalance(depositAddress.userId, tx);
      }
    }

    return newTx;
  });

  if (initialStatus === "PENDING") {
    console.log(`[Deposit] Transaction registered (pending):`, {
      transactionId: transaction.id,
      userId: depositAddress.userId,
      amount: amount.toString(),
      token: token.symbol,
      txHash: payload.txHash,
      status: "PENDING",
    });
  } else {
    console.log(`[Deposit] Transaction confirmed and registered:`, {
      transactionId: transaction.id,
      userId: depositAddress.userId,
      amount: amount.toString(),
      token: token.symbol,
      txHash: payload.txHash,
      status: "CONFIRMED",
    });
  }

  // Só verifica ativação se transação já está confirmada
  if (initialStatus === "CONFIRMED") {
    // Atualiza lifetimeVolume da rede (apenas para USDC/USDT)
    if (token.symbol === "USDC" || token.symbol === "USDT") {
      console.log(`[Deposit] Updating network volume for user ${depositAddress.userId}`);
      try {
        await updateNetworkVolume({
          userId: depositAddress.userId,
          amount: amount,
        });
      } catch (error) {
        console.error("[Deposit] CRITICAL ERROR updating network volume:", error);
        throw error;
      }
    }

    try {
      const activationResult = await checkAccountActivation({
        userId: depositAddress.userId,
      });

      if (activationResult.activated) {
        console.log(`[Deposit] Account activated! Total: $${activationResult.currentTotalUSD.toFixed(2)} USD`);
      } else {
        console.log(`[Deposit] Missing $${activationResult.missingUSD.toFixed(2)} USD to activate`);
      }
    } catch (error) {
      console.error("[Deposit] Error checking account activation:", error);
    }

    // Verifica progressão de rank (MLM)
    try {
      const promoted = await autoCheckAndPromote(depositAddress.userId);

      if (promoted) {
        console.log(`[Deposit] User promoted automatically!`);
      }
    } catch (error) {
      console.error("[Deposit] Error checking rank progression:", error);
    }

    // Auto-bloqueia saldo para upgrade de rank (USDC ou USDT)
    if (token.symbol === "USDC" || token.symbol === "USDT") {
      try {
        const blockResult = await autoBlockBalance({ userId: depositAddress.userId });

        if (blockResult.blocked) {
          console.log(`[Deposit] Balance auto-blocked:`, {
            amountBlocked: blockResult.amountBlocked,
            previousRank: blockResult.previousRank,
            newRank: blockResult.newRank,
          });
        }
      } catch (error) {
        console.error("[Deposit] Error auto-blocking balance:", error);
      }
    }
  }

  return {
    message: "Transaction registered successfully",
    transactionId: transaction.id,
    amount: amount.toString(),
    tokenSymbol: token.symbol,
  };
}

// Export alias for backwards compatibility
export { processDeposit as processMoralisWebhook };
