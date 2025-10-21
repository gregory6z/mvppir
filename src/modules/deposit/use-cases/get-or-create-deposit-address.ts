import { prisma } from "@/lib/prisma";
import { Wallet } from "ethers";
import crypto from "crypto";
import { addAddressToStream } from "../services/moralis-stream.service";

interface GetOrCreateDepositAddressRequest {
  userId: string;
}

interface GetOrCreateDepositAddressResponse {
  id: string;
  polygonAddress: string;
  status: string;
  createdAt: Date;
}

// Função auxiliar para criptografar private key
function encryptPrivateKey(privateKey: string): string {
  const algorithm = "aes-256-gcm";
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
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
    return existingAddress;
  }

  // Cria novo endereço Polygon
  const wallet = Wallet.createRandom();
  const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

  const newAddress = await prisma.depositAddress.create({
    data: {
      userId,
      polygonAddress: wallet.address,
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
    await addAddressToStream(wallet.address);
    console.log(`✅ Endereço ${wallet.address} adicionado ao Moralis Stream`);
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
