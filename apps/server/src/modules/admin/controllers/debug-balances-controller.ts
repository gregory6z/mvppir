/**
 * Debug Balances Controller
 *
 * Shows all active users with their balances for debugging commission issues.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";

export async function debugBalancesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Get all active users with their balances
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        currentRank: true,
        rankStatus: true,
        activatedAt: true,
        balances: {
          select: {
            tokenSymbol: true,
            availableBalance: true,
            lockedBalance: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total balance for each user
    const usersWithTotals = users.map((user) => {
      const totalAvailable = user.balances.reduce(
        (sum, b) => sum + parseFloat(b.availableBalance.toString()),
        0
      );
      const totalLocked = user.balances.reduce(
        (sum, b) => sum + parseFloat(b.lockedBalance.toString()),
        0
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        currentRank: user.currentRank,
        rankStatus: user.rankStatus,
        activatedAt: user.activatedAt,
        balances: user.balances,
        totalAvailable,
        totalLocked,
        total: totalAvailable + totalLocked,
      };
    });

    return reply.status(200).send({
      totalUsers: usersWithTotals.length,
      users: usersWithTotals,
    });
  } catch (error) {
    request.log.error({ error }, "Error fetching debug balances");
    return reply.status(500).send({
      error: "Failed to fetch balances",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
