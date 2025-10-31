import { prisma } from "@/lib/prisma"

interface GetCommissionsSummaryRequest {
  userId: string
}

interface CommissionsSummary {
  today: number
  thisMonth: number
  total: number
}

/**
 * GET /mlm/commissions/summary
 *
 * Returns commission aggregations for authenticated user:
 * - today: Sum of commissions created today (status=PAID)
 * - thisMonth: Sum of commissions created this month (status=PAID)
 * - total: Sum of all commissions (status=PAID)
 */
export async function getCommissionsSummary({
  userId,
}: GetCommissionsSummaryRequest): Promise<CommissionsSummary> {
  const now = new Date()

  // Today (start of day)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // This month (first day of current month)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Aggregate commissions for today
  const todayCommissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      createdAt: {
        gte: today,
      },
    },
    _sum: {
      finalAmount: true,
    },
  })

  // Aggregate commissions for this month
  const monthCommissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      createdAt: {
        gte: thisMonth,
      },
    },
    _sum: {
      finalAmount: true,
    },
  })

  // Aggregate all commissions (lifetime)
  const totalCommissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
    },
    _sum: {
      finalAmount: true,
    },
  })

  return {
    today: todayCommissions._sum.finalAmount?.toNumber() || 0,
    thisMonth: monthCommissions._sum.finalAmount?.toNumber() || 0,
    total: totalCommissions._sum.finalAmount?.toNumber() || 0,
  }
}
