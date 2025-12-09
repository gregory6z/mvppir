import Moralis from "moralis";
import { config } from "dotenv";

config();

async function main() {
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

  if (!MORALIS_API_KEY) {
    console.error("❌ MORALIS_API_KEY não configurada");
    return;
  }

  await Moralis.start({ apiKey: MORALIS_API_KEY });

  const streamId = "afba0650-48e9-4180-8c96-5301222cf63f";

  console.log("🔧 Atualizando configuração do Stream...\n");

  try {
    // Usar formato STRING para topic0 (não hash)
    const topic = "Transfer(address,address,uint256)";

    const updated = await Moralis.Streams.update({
      id: streamId,
      topic0: [topic], // Formato correto: string, não hash
    });

    console.log("✅ Stream atualizado!");
    console.log(`   includeContractLogs: ${updated.raw.includeContractLogs}`);
    console.log(`   includeAllTxLogs: ${updated.raw.includeAllTxLogs}`);
    console.log(`   topic0: ${JSON.stringify(updated.raw.topic0)}`);
  } catch (e: any) {
    console.log(`❌ Erro: ${e.message}`);
  }
}

main().catch(console.error);
