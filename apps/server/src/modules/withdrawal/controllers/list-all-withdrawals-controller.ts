import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { WithdrawalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  status: z
    .enum([
      "PENDING_APPROVAL",
      "APPROVED",
      "PROCESSING",
      "COMPLETED",
      "REJECTED",
      "FAILED",
    ])
    .optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
});

/**
 * GET /admin/withdrawals
 * Lista todos os saques (com filtros opcionais)
 * Query params: ?status=PENDING_APPROVAL&page=1&limit=20
 */
export async function listAllWithdrawalsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { status, page, limit } = querySchema.parse(request.query);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status: status as WithdrawalStatus } : {};

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    // Busca dados dos admins que aprovaram os saques
    const adminIds = withdrawals
      .filter((w) => w.approvedBy)
      .map((w) => w.approvedBy as string);

    const admins = adminIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: adminIds } },
          select: { id: true, email: true, name: true },
        })
      : [];

    const adminMap = new Map(admins.map((a) => [a.id, a]));

    // Adiciona dados do admin a cada withdrawal
    const withdrawalsWithAdmin = withdrawals.map((w) => ({
      ...w,
      admin: w.approvedBy ? adminMap.get(w.approvedBy) || null : null,
    }));

    return reply.status(200).send({
      withdrawals: withdrawalsWithAdmin,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    request.log.error({ error }, "Error listing all withdrawals");

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Failed to list withdrawals",
    });
  }
}
