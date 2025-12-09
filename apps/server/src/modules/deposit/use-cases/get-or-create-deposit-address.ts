import { prisma } from "@/lib/prisma";
import { Wallet } from "ethers";
import { encryptPrivateKey } from "@/lib/encryption";
import { addAddressToStream } from "@/providers/moralis/stream.provider";

interface GetOrCreateDepositAddressRequest {
  userId: string;
}

interface GetOrCreateDepositAddressResponse {
  id: string;
  polygonAddress: string;
  status: string;
  createdAt: Date;
}

export async function getOrCreateDepositAddress({
  userId,
}: GetOrCreateDepositAddressRequest): Promise<GetOrCreateDepositAddressResponse> {
  // Verifica se já existe um endereço para este usuário
  const existingAddress = await prisma.depositAddress.findUnique({
    where: { userId },
    select: {
      id: true,
      polygonAddress: true,
      status: true,
      createdAt: true,
      moralisRegistered: true,
    },
  });

  if (existingAddress) {
    // Fallback: ensure address is registered with Moralis Stream
    // (in case it wasn't registered during signup)
    if (!existingAddress.moralisRegistered) {
      try {
        await addAddressToStream(existingAddress.polygonAddress);
        await prisma.depositAddress.update({
          where: { id: existingAddress.id },
          data: { moralisRegistered: true },
        });
        console.log(`✅ Registered ${existingAddress.polygonAddress} with Moralis Stream (fallback)`);
      } catch (error) {
        console.error(`⚠️ Failed to register ${existingAddress.polygonAddress} with Moralis:`, error instanceof Error ? error.message : error);
      }
    }
    return {
      id: existingAddress.id,
      polygonAddress: existingAddress.polygonAddress,
      status: existingAddress.status,
      createdAt: existingAddress.createdAt,
    };
  }

  // Cria novo endereço Polygon
  const wallet = Wallet.createRandom();
  const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);
  const polygonAddress = wallet.address.toLowerCase();

  const newAddress = await prisma.depositAddress.create({
    data: {
      userId,
      polygonAddress,
      privateKey: encryptedPrivateKey,
      status: "ACTIVE",
      moralisRegistered: false,
    },
    select: {
      id: true,
      polygonAddress: true,
      status: true,
      createdAt: true,
    },
  });

  // Adiciona o endereço ao Moralis Stream para monitoramento automático
  try {
    await addAddressToStream(polygonAddress);
    await prisma.depositAddress.update({
      where: { id: newAddress.id },
      data: { moralisRegistered: true },
    });
    console.log(`✅ Endereço ${polygonAddress} adicionado ao Moralis Stream`);
  } catch (error) {
    console.error(`⚠️ Erro ao adicionar endereço ${polygonAddress} ao Moralis Stream:`, error);
    // Não falha - cron job vai tentar novamente
  }

  return newAddress;
}
