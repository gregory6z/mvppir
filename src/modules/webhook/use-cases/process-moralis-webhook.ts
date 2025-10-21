import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { checkAccountActivation } from "@/modules/user/use-cases/check-account-activation";

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

// Tokens conhecidos na Polygon Mainnet (para referência)
// Qualquer outro token ERC20 também será aceito usando os dados do Moralis
const KNOWN_TOKENS = {
  // USDC (Circle)
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
  },
  // USDT (Tether)
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": {
    symbol: "USDT",
    decimals: 6,
    name: "Tether USD",
  },
  // MATIC (nativo)
  NATIVE: {
    symbol: "MATIC",
    decimals: 18,
    name: "Polygon",
  },
} as const;

interface TokenInfo {
  symbol: string;
  decimals: number;
  name: string;
}

/**
 * Identifica o token recebido (conhecido ou desconhecido)
 * Aceita QUALQUER token ERC20
 */
function identifyToken(payload: MoralisWebhookPayload): TokenInfo {
  const isNativeToken = !payload.tokenAddress;

  // Transação nativa (MATIC)
  if (isNativeToken) {
    return KNOWN_TOKENS.NATIVE;
  }

  const tokenAddress = payload.tokenAddress!.toLowerCase();

  // Verifica se é um token conhecido
  const knownToken = KNOWN_TOKENS[tokenAddress as keyof typeof KNOWN_TOKENS];

  if (knownToken) {
    return knownToken;
  }

  // Token desconhecido - usa dados do Moralis
  // Se o Moralis não enviou os dados, usa valores padrão
  return {
    symbol: payload.tokenSymbol || "UNKNOWN",
    decimals: parseInt(payload.tokenDecimals || "18"),
    name: payload.tokenName || "Unknown Token",
  };
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

  // Verifica se a transação já foi processada
  const existingTx = await prisma.walletTransaction.findUnique({
    where: { txHash: payload.txHash },
  });

  if (existingTx) {
    console.log(`ℹ️  Transação já processada: ${payload.txHash}`);
    return { message: "Transaction already processed", txHash: payload.txHash };
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

  // Cria transação válida
  const transaction = await prisma.walletTransaction.create({
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
      status: "PENDING", // Será processado pelo job de transferência em lote
    },
  });

  console.log(`✅ Transação registrada com sucesso:`, {
    transactionId: transaction.id,
    userId: depositAddress.userId,
    amount: amount.toString(),
    token: token.symbol,
    txHash: payload.txHash,
  });

  // Verifica se a conta deve ser ativada (depósito >= $100 USD)
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

  return {
    message: "Transaction registered successfully",
    transactionId: transaction.id,
    amount: amount.toString(),
    tokenSymbol: token.symbol,
  };
}
