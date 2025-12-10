import { prisma } from "@/lib/prisma";
import { Wallet } from "ethers";
import { encryptPrivateKey } from "@/lib/encryption";
import { addDepositAddressToCache } from "@/modules/deposit/listeners/blockchain-listener";

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
    },
  });

  if (existingAddress) {
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
    },
    select: {
      id: true,
      polygonAddress: true,
      status: true,
      createdAt: true,
    },
  });

  // Adiciona ao cache do WebSocket listener (imediato)
  try {
    addDepositAddressToCache(polygonAddress);
  } catch (error) {
    // Não falha se o listener não estiver rodando
    console.log(`[Deposit] WebSocket cache not available, will be loaded on next refresh`);
  }

  console.log(`[Deposit] New address created: ${polygonAddress}`);

  return newAddress;
}
