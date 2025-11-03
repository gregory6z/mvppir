import { prisma } from "@/lib/prisma"

interface GetCommissionsSummaryRequest {
  userId: string
}

interface CommissionsSummary {
  today: number
  thisMonth: number
  total: number
  byLevel: {
    N0: number // Comissões sobre próprio saldo
    N1: number // Comissões sobre diretos
    N2: number // Comissões sobre indiretos N2
    N3: number // Comissões sobre indiretos N3
  }
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

  // Aggregate by level (N0, N1, N2, N3)
  const n0Commissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      level: 0, // N0 - próprio saldo
    },
    _sum: {
      finalAmount: true,
    },
  })

  const n1Commissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      level: 1, // N1 - diretos
    },
    _sum: {
      finalAmount: true,
    },
  })

  const n2Commissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      level: 2, // N2 - indiretos
    },
    _sum: {
      finalAmount: true,
    },
  })

  const n3Commissions = await prisma.commission.aggregate({
    where: {
      userId,
      status: "PAID",
      level: 3, // N3 - indiretos
    },
    _sum: {
      finalAmount: true,
    },
  })

  return {
    today: todayCommissions._sum.finalAmount?.toNumber() || 0,
    thisMonth: monthCommissions._sum.finalAmount?.toNumber() || 0,
    total: totalCommissions._sum.finalAmount?.toNumber() || 0,
    byLevel: {
      N0: n0Commissions._sum.finalAmount?.toNumber() || 0,
      N1: n1Commissions._sum.finalAmount?.toNumber() || 0,
      N2: n2Commissions._sum.finalAmount?.toNumber() || 0,
      N3: n3Commissions._sum.finalAmount?.toNumber() || 0,
    },
  }
}
