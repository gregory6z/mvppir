import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  userEmail: z.string().email(),
});

export async function activateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { userEmail } = schema.parse(request.body);

    const user = await prisma.user.update({
      where: { email: userEmail },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
      },
    });

    return reply.status(200).send({
      success: true,
      message: `User ${userEmail} activated`,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        activatedAt: user.activatedAt,
      },
    });
  } catch (error) {
    return reply.status(500).send({
      error: "Failed to activate user",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
