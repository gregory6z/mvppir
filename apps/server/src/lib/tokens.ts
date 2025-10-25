// Tokens conhecidos na Polygon Mainnet (para referência)
// Qualquer outro token ERC20 também será aceito usando os dados do Moralis
export const KNOWN_TOKENS = {
  // TestUSDC (Polygon Amoy Testnet) - Deploy de teste
  "0xd7acd2a9fd159e69bb102a1ca21c9a3e3a5f771b": {
    symbol: "USDC",
    decimals: 6,
    name: "Test USDC",
  },
  // USDC (Circle - Polygon Mainnet)
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
  },
  // USDT (Tether - Polygon Mainnet)
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

export interface TokenInfo {
  symbol: string;
  decimals: number;
  name: string;
}

export interface TokenPayload {
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: string;
}

/**
 * Identifica o token recebido (conhecido ou desconhecido)
 * Aceita QUALQUER token ERC20
 *
 * @param payload - Dados do token do webhook
 * @returns Informações do token identificado
 */
export function identifyToken(payload: TokenPayload): TokenInfo {
  const isNativeToken = !payload.tokenAddress;

  // Transação nativa (MATIC)
  if (isNativeToken) {
    return KNOWN_TOKENS.NATIVE;
  }

  const tokenAddress = payload.tokenAddress!.toLowerCase();

  // Verifica se é um token conhecido
  const knownToken =
    KNOWN_TOKENS[tokenAddress as keyof typeof KNOWN_TOKENS];

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
