import { FastifyRequest, FastifyReply } from "fastify";
import { getNetworkLevels } from "../use-cases/get-network-levels";
import { getNetworkStats } from "../helpers/network";

/**
 * GET /api/mlm/network
 *
 * Returns the MLM network tree (N1, N2, N3) for authenticated user.
 */
export async function getNetworkController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const levels = await getNetworkLevels(userId);
    const stats = await getNetworkStats(userId);

    return reply.status(200).send({
      levels: {
        N1: levels.N1.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          rank: u.currentRank,
          totalBalance: parseFloat(u.totalBalance.toString()),
          joinedAt: u.createdAt,
        })),
        N2: levels.N2.map((u) => ({
          id: u.id,
          name: u.name,
          rank: u.currentRank,
          totalBalance: parseFloat(u.totalBalance.toString()),
        })),
        N3: levels.N3.map((u) => ({
          id: u.id,
          name: u.name,
          rank: u.currentRank,
          totalBalance: parseFloat(u.totalBalance.toString()),
        })),
      },
      stats: {
        N1: {
          count: stats.N1.count,
          totalBalance: parseFloat(stats.N1.totalBalance.toString()),
        },
        N2: {
          count: stats.N2.count,
          totalBalance: parseFloat(stats.N2.totalBalance.toString()),
        },
        N3: {
          count: stats.N3.count,
          totalBalance: parseFloat(stats.N3.totalBalance.toString()),
        },
        totalNetworkSize: stats.totalNetworkSize,
        totalNetworkBalance: parseFloat(stats.totalNetworkBalance.toString()),
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get network data",
    });
  }
}
