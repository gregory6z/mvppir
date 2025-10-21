import { Moralis, initMoralis } from "@/lib/moralis";
import { env } from "@/config/env";

const STREAM_ID_KEY = "POLYGON_USDC_STREAM_ID";

/**
 * Busca ou cria o Stream principal da aplicação
 * Este Stream monitora todos os endereços de depósito dos usuários
 */
export async function getOrCreateMainStream(): Promise<string> {
  await initMoralis();

  // Tenta buscar o stream existente
  // Nota: O ID do stream pode ser armazenado no banco ou em uma variável de ambiente
  const existingStreamId = process.env[STREAM_ID_KEY];

  if (existingStreamId) {
    try {
      const stream = await Moralis.Streams.getById({ id: existingStreamId });
      if (stream) {
        return existingStreamId;
      }
    } catch (error) {
      // Stream não existe, vamos criar um novo
      console.log("Stream não encontrado, criando novo...");
    }
  }

  // Cria novo Stream
  const response = await Moralis.Streams.add({
    webhookUrl: `${env.API_BASE_URL}/webhooks/moralis`,
    description: "MVP PIR - Monitor de Depósitos USDC/MATIC/USDT",
    tag: "deposit_monitor",
    chains: ["0x89"], // Polygon Mainnet
    includeNativeTxs: true, // Monitora MATIC
    includeInternalTxs: false,
    includeAllTxLogs: true, // Para pegar eventos ERC20
    abi: [
      // ABI do evento Transfer do ERC20 (USDC, USDT, etc)
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "from", type: "address" },
          { indexed: true, name: "to", type: "address" },
          { indexed: false, name: "value", type: "uint256" },
        ],
        name: "Transfer",
        type: "event",
      },
    ],
  });

  const streamId = response.raw.id;

  console.log(`✅ Stream criado com sucesso: ${streamId}`);
  console.log(`⚠️  Adicione ao .env: ${STREAM_ID_KEY}="${streamId}"`);

  return streamId;
}

/**
 * Adiciona um novo endereço ao Stream
 * Chamado quando um usuário cria seu endereço de depósito
 */
export async function addAddressToStream(address: string): Promise<void> {
  await initMoralis();

  const streamId = await getOrCreateMainStream();

  try {
    await Moralis.Streams.addAddress({
      id: streamId,
      address: [address.toLowerCase()], // Moralis espera array e lowercase
    });

    console.log(`✅ Endereço adicionado ao Stream: ${address}`);
  } catch (error: any) {
    // Se o endereço já existe, ignora o erro
    if (error?.message?.includes("already exists")) {
      console.log(`ℹ️  Endereço já estava no Stream: ${address}`);
      return;
    }

    throw error;
  }
}

/**
 * Remove um endereço do Stream
 * Útil se precisar desativar um endereço
 */
export async function removeAddressFromStream(
  address: string
): Promise<void> {
  await initMoralis();

  const streamId = await getOrCreateMainStream();

  await Moralis.Streams.deleteAddress({
    id: streamId,
    address: address.toLowerCase(),
  });

  console.log(`✅ Endereço removido do Stream: ${address}`);
}

/**
 * Lista todos os endereços monitorados no Stream
 */
export async function listStreamAddresses(): Promise<string[]> {
  await initMoralis();

  const streamId = await getOrCreateMainStream();

  const response = await Moralis.Streams.getAddresses({ id: streamId });

  return response.raw.result.map((item: any) => item.address);
}
