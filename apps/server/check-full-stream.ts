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

  console.log("🔍 Buscando configuração do Stream...\n");

  const stream = await Moralis.Streams.getById({ id: streamId });

  console.log("📡 Configuração completa do Stream:");
  console.log(JSON.stringify(stream.raw, null, 2));
}

main().catch(console.error);
