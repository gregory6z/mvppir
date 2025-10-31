import { prisma } from "@/lib/prisma"

interface GetRecentCommissionsRequest {
  userId: string
  limit?: number
}

interface RecentCommission {
  id: string
  level: number
  fromUserId: string
  fromUserName: string
  baseAmount: number
  percentage: number
  finalAmount: number
  referenceDate: Date
  status: "PENDING" | "PAID" | "CANCELLED"
  createdAt: Date
}

interface GetRecentCommissionsResponse {
  commissions: RecentCommission[]
}

/**
 * GET /mlm/commissions/recent?limit=10
 *
 * Returns recent commissions for authenticated user with fromUser details.
 * Ordered by createdAt DESC (most recent first).
 */
export async function getRecentCommissions({
  userId,
  limit = 10,
}: GetRecentCommissionsRequest): Promise<GetRecentCommissionsResponse> {
  const commissions = await prisma.commission.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      level: true,
      fromUserId: true,
      baseAmount: true,
      percentage: true,
      finalAmount: true,
      referenceDate: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })

  // Get unique fromUserIds to fetch names
  const fromUserIds = [...new Set(commissions.map((c) => c.fromUserId))]

  const fromUsers = await prisma.user.findMany({
    where: {
      id: {
        in: fromUserIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  // Map fromUserId to name
  const userMap = new Map(fromUsers.map((u) => [u.id, u.name]))

  // Format response
  const formattedCommissions: RecentCommission[] = commissions.map((c) => ({
    id: c.id,
    level: c.level,
    fromUserId: c.fromUserId,
    fromUserName: userMap.get(c.fromUserId) || "Unknown User",
    baseAmount: c.baseAmount.toNumber(),
    percentage: c.percentage.toNumber(),
    finalAmount: c.finalAmount.toNumber(),
    referenceDate: c.referenceDate,
    status: c.status,
    createdAt: c.createdAt,
  }))

  return {
    commissions: formattedCommissions,
  }
}
