import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { checkAccountActivation } from "@/modules/user/use-cases/check-account-activation";
import { identifyToken, KNOWN_TOKENS } from "@/lib/tokens";

interface MoralisWebhookPayload {
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

interface ProcessMoralisWebhookRequest {
  payload: MoralisWebhookPayload;
}

export async function processMoralisWebhook({
  payload,
}: ProcessMoralisWebhookRequest) {
  // Validações iniciais
  if (!payload.txHash) {
    throw new Error("INVALID_PAYLOAD: txHash missing");
  }

  if (!payload.to) {
    throw new Error("INVALID_PAYLOAD: recipient address missing");
  }

  if (!payload.value || payload.value === "0") {
    console.warn("⚠️  Transação com valor zero ignorada:", payload.txHash);
    return { message: "Zero value transaction ignored", txHash: payload.txHash };
  }

  // Verifica se a transação já existe
  const existingTx = await prisma.walletTransaction.findUnique({
    where: { txHash: payload.txHash },
  });

  // Se já existe e está confirmada, ignora
  if (existingTx && existingTx.status === "CONFIRMED") {
    console.log(`ℹ️  Transação já confirmada: ${payload.txHash}`);
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

      return updatedTx;
    });

    console.log(`✅ Transação confirmada pela blockchain:`, {
      transactionId: updated.id,
      txHash: payload.txHash,
      previousStatus: "PENDING",
      newStatus: "CONFIRMED",
    });

    // Verifica ativação de conta após confirmação
    try {
      const activationResult = await checkAccountActivation({
        userId: existingTx.userId,
      });

      if (activationResult.activated) {
        console.log(`🎉 Conta ativada! Total depositado: $${activationResult.currentTotalUSD.toFixed(2)} USD`);
      }
    } catch (error) {
      console.error("⚠️  Erro ao verificar ativação de conta:", error);
    }

    return {
      message: "Transaction confirmed",
      transactionId: updated.id,
      status: "CONFIRMED",
    };
  }

  // Se já existe como PENDING mas confirmed ainda é false, ignora (aguarda confirmação)
  if (existingTx && existingTx.status === "PENDING" && !payload.confirmed) {
    console.log(`⏳ Transação ainda aguardando confirmação: ${payload.txHash}`);
    return { message: "Transaction already pending confirmation", txHash: payload.txHash };
  }

  // Busca o endereço de depósito
  const depositAddress = await prisma.depositAddress.findUnique({
    where: { polygonAddress: payload.to.toLowerCase() },
    include: { user: true },
  });

  if (!depositAddress) {
    console.error(`❌ Endereço de depósito não encontrado: ${payload.to}`);
    throw new Error(`DEPOSIT_ADDRESS_NOT_FOUND: ${payload.to}`);
  }

  // Verifica se o endereço está ativo
  if (depositAddress.status !== "ACTIVE") {
    console.warn(
      `⚠️  Depósito em endereço inativo (${depositAddress.status}):`,
      payload.to
    );
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
    console.log(`ℹ️  Token não-padrão detectado:`, {
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
    console.warn(`⚠️  Valor muito pequeno ignorado: ${amount.toString()} ${token.symbol}`);
    return {
      message: "Transaction value too small",
      amount: amount.toString(),
      txHash: payload.txHash,
    };
  }

  // Determina status inicial baseado na confirmação
  const initialStatus = payload.confirmed ? "CONFIRMED" : "PENDING";

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
    }

    return newTx;
  });

  if (initialStatus === "PENDING") {
    console.log(`⏳ Transação registrada (aguardando confirmação):`, {
      transactionId: transaction.id,
      userId: depositAddress.userId,
      amount: amount.toString(),
      token: token.symbol,
      txHash: payload.txHash,
      status: "PENDING",
    });
  } else {
    console.log(`✅ Transação confirmada e registrada:`, {
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
    try {
      const activationResult = await checkAccountActivation({
        userId: depositAddress.userId,
      });

      if (activationResult.activated) {
        console.log(`🎉 Conta ativada! Total depositado: $${activationResult.currentTotalUSD.toFixed(2)} USD`);
      } else {
        console.log(
          `⏳ Faltam $${activationResult.missingUSD.toFixed(2)} USD para ativar a conta`
        );
      }
    } catch (error) {
      // Não falha a operação se a verificação de ativação falhar
      console.error("⚠️  Erro ao verificar ativação de conta:", error);
    }
  }

  return {
    message: "Transaction registered successfully",
    transactionId: transaction.id,
    amount: amount.toString(),
    tokenSymbol: token.symbol,
  };
}
