/**
 * Teste Mock do Webhook Moralis
 *
 * Como usar:
 * npx tsx tests/webhook-test.ts
 */

import { keccak256 } from "ethers";

const API_BASE_URL = "http://localhost:3333";
const MORALIS_STREAM_SECRET = process.env.MORALIS_STREAM_SECRET!;

// Payload de exemplo do Moralis para depósito de USDC
const mockUSDCPayload = {
  confirmed: true,
  chainId: "0x89",
  txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Substituir pelo endereço gerado
  from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
  value: "1000000", // 1 USDC (6 decimals)
  tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  tokenName: "USD Coin",
  tokenSymbol: "USDC",
  tokenDecimals: "6",
  block: {
    number: "12345678",
    timestamp: "1234567890",
  },
};

// Payload de exemplo para token desconhecido (SHIB)
const mockSHIBPayload = {
  confirmed: true,
  chainId: "0x89",
  txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Substituir pelo endereço gerado
  from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
  value: "1000000000000000000", // 1 SHIB (18 decimals)
  tokenAddress: "0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec",
  tokenName: "SHIBA INU",
  tokenSymbol: "SHIB",
  tokenDecimals: "18",
  block: {
    number: "12345679",
    timestamp: "1234567891",
  },
};

// Payload de exemplo para MATIC nativo
const mockMATICPayload = {
  confirmed: true,
  chainId: "0x89",
  txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Substituir pelo endereço gerado
  from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
  value: "1000000000000000000", // 1 MATIC (18 decimals)
  // Sem tokenAddress = transação nativa
  block: {
    number: "12345680",
    timestamp: "1234567892",
  },
};

/**
 * Gera assinatura Moralis usando Keccak256
 */
function generateMoralisSignature(payload: any): string {
  const data = JSON.stringify(payload) + MORALIS_STREAM_SECRET;
  return keccak256(Buffer.from(data));
}

/**
 * Envia requisição ao webhook
 */
async function sendWebhookRequest(payload: any, testName: string) {
  const signature = generateMoralisSignature(payload);

  console.log(`\n🧪 Teste: ${testName}`);
  console.log(`📝 Payload:`, JSON.stringify(payload, null, 2));
  console.log(`🔐 Signature: ${signature}`);

  try {
    const response = await fetch(`${API_BASE_URL}/webhooks/moralis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log(`📊 Status: ${response.status}`);
    console.log(`✅ Response:`, JSON.stringify(result, null, 2));

    return result;
  } catch (error: any) {
    console.error(`❌ Erro:`, error.message);
    throw error;
  }
}

/**
 * Script principal de testes
 */
async function runTests() {
  console.log("🚀 Iniciando testes do webhook Moralis\n");
  console.log("⚠️  IMPORTANTE: Substitua o campo 'to' pelos endereços gerados no sistema!\n");

  if (!MORALIS_STREAM_SECRET) {
    console.error("❌ MORALIS_STREAM_SECRET não configurado no .env");
    process.exit(1);
  }

  try {
    // Teste 1: USDC (token conhecido)
    await sendWebhookRequest(mockUSDCPayload, "Depósito de USDC (Token Conhecido)");

    // Aguarda 1 segundo entre testes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Teste 2: SHIB (token desconhecido)
    await sendWebhookRequest(mockSHIBPayload, "Depósito de SHIB (Token Desconhecido)");

    // Aguarda 1 segundo entre testes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Teste 3: MATIC (nativo)
    await sendWebhookRequest(mockMATICPayload, "Depósito de MATIC (Nativo)");

    console.log("\n✅ Todos os testes concluídos!");
  } catch (error) {
    console.error("\n❌ Falha nos testes");
    process.exit(1);
  }
}

// Executa os testes
runTests();
