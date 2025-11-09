import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

interface InjectTestDepositInput {
  userEmail: string
  tokenSymbol: string
  amount: number
  tokenAddress?: string
  tokenDecimals?: number
}

interface InjectTestDepositOutput {
  transaction: {
    id: string
    userId: string
    tokenSymbol: string
    amount: string
    status: string
    isTest: boolean
    createdAt: Date
  }
}

/**
 * Injeta um depósito de teste para um usuário
 *
 * Regras:
 * - Apenas admins podem executar
 * - Cria transação com isTest=true
 * - NÃO afeta balance real (não atualiza tabela Balance)
 * - NÃO conta para ativação de conta
 * - Aparece no histórico mas marcado como teste
 */
export async function injectTestDeposit(
  input: InjectTestDepositInput
): Promise<InjectTestDepositOutput> {
  const { userEmail, tokenSymbol, amount, tokenAddress, tokenDecimals = 18 } = input

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
  const testTxHash = `TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`

  // 3. Converter amount para rawAmount
  const amountDecimal = new Decimal(amount)
  const rawAmount = amountDecimal.mul(new Decimal(10).pow(tokenDecimals)).toString()

  // 4. Criar transação de teste
  const transaction = await prisma.walletTransaction.create({
    data: {
      userId: user.id,
      depositAddressId: depositAddress.id,
      type: "CREDIT",
      tokenSymbol,
      tokenAddress,
      tokenDecimals,
      amount: amountDecimal,
      rawAmount,
      txHash: testTxHash,
      status: "CONFIRMED", // Já começa confirmada
      isTest: true, // 🔑 Flag que marca como teste
    },
  })

  console.log(`✅ Test deposit injected for ${userEmail}:`, {
    amount: `${amount} ${tokenSymbol}`,
    txHash: testTxHash,
    isTest: true,
  })

  return {
    transaction: {
      id: transaction.id,
      userId: transaction.userId,
      tokenSymbol: transaction.tokenSymbol,
      amount: transaction.amount.toString(),
      status: transaction.status,
      isTest: transaction.isTest,
      createdAt: transaction.createdAt,
    },
  }
}
