/**
 * Provider de conversão de preços de tokens para USD
 *
 * Usa API pública da CoinGecko (grátis, sem auth necessária)
 * Limite: 10-50 req/min (suficiente para MVP)
 */

interface TokenPrice {
  usd: number;
  lastUpdate: Date;
}

// Cache de preços (válido por 5 minutos)
const priceCache = new Map<string, TokenPrice>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Mapeamento de símbolos para IDs do CoinGecko
const TOKEN_IDS: Record<string, string> = {
  USDC: "usd-coin",
  USDT: "tether",
  MATIC: "polygon-ecosystem-token", // Rebrand: MATIC -> POL
  POL: "polygon-ecosystem-token",
  DAI: "dai",
  WETH: "weth",
  WBTC: "wrapped-bitcoin",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
};

/**
 * Busca preço de um token em USD
 */
export async function getTokenPriceUSD(tokenSymbol: string): Promise<number> {
  const normalizedSymbol = tokenSymbol.toUpperCase();

  // Stablecoins e USD sempre valem $1
  if (["USDC", "USDT", "DAI", "BUSD", "TUSD", "USD"].includes(normalizedSymbol)) {
    return 1.0;
  }

  // Verifica cache
  const cached = priceCache.get(normalizedSymbol);
  if (cached && Date.now() - cached.lastUpdate.getTime() < CACHE_TTL) {
    return cached.usd;
  }

  // Busca preço na API
  const coinGeckoId = TOKEN_IDS[normalizedSymbol];
  if (!coinGeckoId) {
    console.warn(`⚠️  Token ${tokenSymbol} não encontrado no mapeamento. Assumindo $0`);
    return 0;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = (await response.json()) as Record<
      string,
      { usd?: number }
    >;
    const price = data[coinGeckoId]?.usd;

    if (!price) {
      throw new Error(`Price not found for ${coinGeckoId}`);
    }

    // Atualiza cache
    priceCache.set(normalizedSymbol, {
      usd: price,
      lastUpdate: new Date(),
    });

    console.log(`💰 Preço ${tokenSymbol}: $${price.toFixed(2)}`);

    return price;
  } catch (error: any) {
    console.error(`❌ Erro ao buscar preço de ${tokenSymbol}:`, error.message);

    // Fallback: retorna valor do cache mesmo expirado
    if (cached) {
      console.warn(`⚠️  Usando preço em cache (expirado) para ${tokenSymbol}`);
      return cached.usd;
    }

    // Se não tem cache, assume 0 para não ativar conta por engano
    return 0;
  }
}

/**
 * Converte quantidade de tokens para USD
 */
export async function convertToUSD(
  tokenSymbol: string,
  amount: number
): Promise<number> {
  const price = await getTokenPriceUSD(tokenSymbol);
  const usdValue = amount * price;

  console.log(`🔄 ${amount} ${tokenSymbol} = $${usdValue.toFixed(2)} USD`);

  return usdValue;
}

/**
 * Calcula valor total em USD de múltiplos tokens
 */
export async function calculateTotalUSD(
  balances: Record<string, number>
): Promise<number> {
  let total = 0;

  for (const [symbol, amount] of Object.entries(balances)) {
    const usdValue = await convertToUSD(symbol, amount);
    total += usdValue;
  }

  console.log(`💵 Valor total: $${total.toFixed(2)} USD`);

  return total;
}

/**
 * Busca preços de múltiplos tokens de uma vez
 */
export async function getPrices(
  tokenSymbols: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  for (const symbol of tokenSymbols) {
    prices[symbol] = await getTokenPriceUSD(symbol);
  }

  return prices;
}

/**
 * Limpa o cache de preços (útil para testes)
 */
export function clearPriceCache() {
  priceCache.clear();
}
