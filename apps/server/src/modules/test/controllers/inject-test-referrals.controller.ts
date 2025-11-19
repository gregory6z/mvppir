import { FastifyRequest, FastifyReply } from "fastify"
import { z } from "zod"
import { injectTestReferrals } from "../use-cases/inject-test-referrals"

const injectTestReferralsSchema = z.object({
  referrerEmail: z.string().email(),
  count: z.number().int().min(1).max(100),
  depositAmount: z.number().positive().optional(),
})

/**
 * POST /admin/test/inject-referrals
 *
 * Injeta diretos de teste (N1) para um usuário
 * Cada direto é criado com:
 * - Email fake (test-referral-{timestamp}-{index}@test.com)
 * - Status ACTIVE
 * - Depósito inicial (default 100 USDC)
 * - Deposit address gerado
 *
 * Isso permite testar sistema de ranks e comissões MLM
 */
export async function injectTestReferralsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log("🚀 INJECT TEST REFERRALS CONTROLLER CALLED", new Date().toISOString())

  try {
    const data = injectTestReferralsSchema.parse(request.body)

    const result = await injectTestReferrals(data)

    return reply.status(201).send({
      success: true,
      message: result.message,
      data: result,
    })
  } catch (error: any) {
    console.error("❌ Failed to inject test referrals:", error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: "Validation error",
        details: error.issues,
      })
    }

    if (error.message.includes("not found")) {
      return reply.status(404).send({
        success: false,
        error: error.message,
      })
    }

    if (error.message.includes("must be between") || error.message.includes("must be at least")) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      })
    }

    return reply.status(500).send({
      success: false,
      error: "Failed to inject test referrals",
      details: error.message,
    })
  }
}
