import { FastifyRequest, FastifyReply } from "fastify";
import { getUserMLMProfile } from "../use-cases/get-user-mlm-profile";

/**
 * GET /api/mlm/profile
 *
 * Returns complete MLM profile for authenticated user.
 */
export async function getMLMProfileController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const profile = await getUserMLMProfile(userId);

    return reply.status(200).send(profile);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get MLM profile",
    });
  }
}
