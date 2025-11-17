import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { injectTestDeposit } from "../use-cases/inject-test-deposit"

const injectTestDepositSchema = z.object({
  userEmail: z.string().email(),
  tokenSymbol: z.string(),
  amount: z.number().positive(),
  tokenAddress: z.string().optional(),
  tokenDecimals: z.number().int().min(0).max(18).optional(),
})

/**
 * POST /admin/test/inject-deposit
 *
 * Injeta um depósito de teste para um usuário
 * Apenas para ambiente de testes - depósitos não afetam balance real
 */
export async function injectTestDepositController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log("🚀🚀🚀 INJECT TEST DEPOSIT CONTROLLER CALLED 🚀🚀🚀", new Date().toISOString())

  try {
    const data = injectTestDepositSchema.parse(request.body)

    const result = await injectTestDeposit(data)

    return reply.status(201).send({
      success: true,
      message: result.message,
      data: result,
    })
  } catch (error: any) {
    console.error("❌ Failed to inject test deposit:", error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: "Validation error",
        details: error.issues,
      })
    }

    if (error.message.includes("not found") || error.message.includes("has no deposit address")) {
      return reply.status(404).send({
        success: false,
        error: error.message,
      })
    }

    return reply.status(500).send({
      success: false,
      error: "Failed to inject test deposit",
    })
  }
}
