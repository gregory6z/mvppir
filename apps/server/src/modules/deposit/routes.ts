import { FastifyInstance } from "fastify";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { getMyAddressController } from "./controllers/get-my-address-controller";

export async function depositRoutes(fastify: FastifyInstance) {
  // Todas as rotas de deposit são protegidas
  fastify.addHook("preHandler", authMiddleware);

  // GET /deposit/my-address - Get or create user's deposit address + QR Code
  fastify.get("/my-address", getMyAddressController);
}
