import { FastifyRequest, FastifyReply } from "fastify";
import { getOrCreateDepositAddress } from "../use-cases/get-or-create-deposit-address";
import QRCode from "qrcode";

export async function getMyAddressController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user!.id;

    const depositAddress = await getOrCreateDepositAddress({ userId });

    // Gera QR Code para o endereço
    const qrCode = await QRCode.toDataURL(depositAddress.polygonAddress);

    return reply.status(200).send({
      ...depositAddress,
      qrCode,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      error: "Internal server error",
      message: "Failed to get deposit address",
    });
  }
}
