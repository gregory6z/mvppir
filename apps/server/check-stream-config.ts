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

  console.log("🔍 Buscando configuração do Stream...\n");

  const stream = await Moralis.Streams.getById({ id: streamId });

  console.log("📡 Configuração completa do Stream:");
  console.log(JSON.stringify(stream.raw, null, 2));
}

main().catch(console.error);
