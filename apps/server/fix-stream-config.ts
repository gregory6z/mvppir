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

  const streamId = process.env.POLYGON_USDC_STREAM_ID;

  if (!streamId) {
    console.error("❌ POLYGON_USDC_STREAM_ID não configurada");
    return;
  }

  console.log("🔧 Atualizando configuração do Stream...\n");

  // Atualiza o stream para incluir logs de contratos (ERC20 transfers)
  const updated = await Moralis.Streams.update({
    id: streamId,
    includeContractLogs: true,
  });

  console.log("✅ Stream atualizado!");
  console.log("\n📡 Nova configuração:");
  console.log(`  includeContractLogs: ${updated.raw.includeContractLogs}`);
  console.log(`  includeAllTxLogs: ${updated.raw.includeAllTxLogs}`);
  console.log(`  status: ${updated.raw.status}`);
}

main().catch(console.error);
