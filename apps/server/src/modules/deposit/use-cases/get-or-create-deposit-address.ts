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
    },
  });

  if (existingAddress) {
    // Fallback: ensure address is registered with Moralis Stream
    // (in case it wasn't registered during signup)
    try {
      await addAddressToStream(existingAddress.polygonAddress);
      console.log(`✅ Verified/added ${existingAddress.polygonAddress} to Moralis Stream`);
    } catch (error) {
      // If already exists in stream, Moralis may throw - that's ok
      console.log(`ℹ️ Address ${existingAddress.polygonAddress} - Moralis response:`, error instanceof Error ? error.message : error);
    }
    return existingAddress;
  }

  // Cria novo endereço Polygon
  const wallet = Wallet.createRandom();
  const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

  const newAddress = await prisma.depositAddress.create({
    data: {
      userId,
      polygonAddress: wallet.address.toLowerCase(), // Sempre em lowercase
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

  // Adiciona o endereço ao Moralis Stream para monitoramento automático
  try {
    await addAddressToStream(wallet.address.toLowerCase());
    console.log(`✅ Endereço ${wallet.address.toLowerCase()} adicionado ao Moralis Stream`);
  } catch (error) {
    console.error(
      `⚠️  Erro ao adicionar endereço ${wallet.address} ao Moralis Stream:`,
      error
    );
    // Não falha a operação se o Moralis Stream falhar
    // O endereço foi criado com sucesso no banco de dados
  }

  return newAddress;
}
