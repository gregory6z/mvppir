/**
 * Get Referral Link Controller
 *
 * Returns the authenticated user's referral link for inviting new users.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import {
  getOrCreateReferralCode,
  getReferralLink,
} from "../use-cases/get-or-create-referral-code";

export async function getReferralLinkController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    // Get referral code and link
    const referralCode = await getOrCreateReferralCode(userId);
    const referralLink = await getReferralLink(userId);

    return reply.status(200).send({
      referralCode,
      referralLink,
      message: "Share this link to invite new users to your network",
    });
  } catch (error) {
    console.error("Error getting referral link:", error);

    return reply.status(500).send({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
