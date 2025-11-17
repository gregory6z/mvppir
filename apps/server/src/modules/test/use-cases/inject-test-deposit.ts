import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { processMoralisWebhook } from "@/modules/webhook/use-cases/process-moralis-webhook"

interface InjectTestDepositInput {
  userEmail: string
  tokenSymbol: string
  amount: number
  tokenAddress?: string
  tokenDecimals?: number
}

interface InjectTestDepositOutput {
  txHash: string
  userId: string
  amount: string
  tokenSymbol: string
  message: string
}

/**
 * Injeta um depósito de teste para um usuário usando o webhook handler
 *
 * Novo fluxo (v2):
 * - Usa o mesmo webhook handler que depósitos reais
 * - Cria payload fake do Moralis com confirmed=true
 * - TUDO é processado automaticamente:
 *   - Balance atualizado
 *   - Ativação de conta verificada
 *   - Rank auto-promovido se elegível
 *   - Saldo auto-bloqueado para rank
 *
 * Benefícios:
 * - Fluxo 100% idêntico a depósitos reais
 * - Não duplica código
 * - Sempre em sincronia com webhook handler
 */
export async function injectTestDeposit(
  input: InjectTestDepositInput
): Promise<InjectTestDepositOutput> {
  const {
    userEmail,
    tokenSymbol,
    amount,
    tokenAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on Polygon (default)
    tokenDecimals = 6
  } = input

  // 1. Buscar usuário pelo email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { depositAddresses: true },
  })

  if (!user) {
    throw new Error(`User with email ${userEmail} not found`)
  }

  if (user.depositAddresses.length === 0) {
    throw new Error(`User ${userEmail} has no deposit address`)
  }

  const depositAddress = user.depositAddresses[0]

  // 2. Gerar txHash fake (prefixo "TEST-")
  const testTxHash = `0xTEST${Date.now()}${Math.random().toString(36).substring(2, 15)}`

  // 3. Converter amount para rawAmount (blockchain format)
  const amountDecimal = new Decimal(amount)
  const rawAmount = amountDecimal.mul(new Decimal(10).pow(tokenDecimals)).toString()

  // 4. Criar payload fake do Moralis (simula webhook real)
  const fakeWebhookPayload = {
    confirmed: true, // Já confirmado na blockchain
    chainId: "0x89", // Polygon
    txHash: testTxHash,
    to: depositAddress.polygonAddress.toLowerCase(), // IMPORTANTE: lowercase para match no webhook handler
    from: "0x0000000000000000000000000000000000000000", // Address fake
    value: rawAmount,
    tokenAddress: tokenAddress?.toLowerCase(),
    tokenName: tokenSymbol,
    tokenSymbol: tokenSymbol,
    tokenDecimals: tokenDecimals.toString(),
    block: {
      number: "999999999",
      timestamp: new Date().toISOString(),
    },
  }

  console.log(`🧪 Injecting test deposit via webhook handler:`, {
    userEmail,
    amount: `${amount} ${tokenSymbol}`,
    txHash: testTxHash,
    depositAddress: depositAddress.polygonAddress,
    depositAddressLowercase: depositAddress.polygonAddress.toLowerCase(),
  })

  console.log(`📦 Full webhook payload:`, JSON.stringify(fakeWebhookPayload, null, 2))

  // 5. Processar via webhook handler (faz TUDO automaticamente)
  const result = await processMoralisWebhook({
    payload: fakeWebhookPayload,
  })

  console.log(`✅ Test deposit processed successfully:`, JSON.stringify(result, null, 2))

  return {
    txHash: testTxHash,
    userId: user.id,
    amount: amount.toString(),
    tokenSymbol,
    message: "Test deposit injected via webhook handler (identical to real deposits)",
  }
}
