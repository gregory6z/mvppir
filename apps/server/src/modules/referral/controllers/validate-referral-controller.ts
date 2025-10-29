import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { validateReferralCode } from "../use-cases/validate-referral-code";

const validateReferralParamsSchema = z.object({
  code: z.string().min(1, "Referral code is required"),
});

export async function validateReferralController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Validate params
    const { code } = validateReferralParamsSchema.parse(request.params);

    // Validate referral code
    const result = await validateReferralCode(code);

    // Return response
    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        valid: false,
        message: error.errors[0].message,
      });
    }

    console.error("Error validating referral code:", error);
    return reply.status(500).send({
      valid: false,
      message: "Internal server error",
    });
  }
}
