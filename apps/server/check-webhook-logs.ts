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

  console.log("🔍 Buscando histórico de webhooks (últimos 20)...\n");

  try {
    const history = await Moralis.Streams.getHistory({
      limit: 20,
    });

    console.log(`Total de webhooks: ${history.result.length}`);

    if (history.result.length === 0) {
      console.log("Nenhum webhook no histórico.");
    } else {
      for (const h of history.result) {
        console.log(`\n📨 Webhook ID: ${h.id}`);
        console.log(`   StreamId: ${h.streamId}`);
        console.log(`   Created: ${h.createdAt}`);
        console.log(`   Delivered: ${h.delivered}`);
        console.log(`   Error: ${h.errorMessage || 'none'}`);
        console.log(`   Payload size: ${JSON.stringify(h).length} bytes`);
      }
    }
  } catch (e: any) {
    console.log(`❌ Erro: ${e.message}`);
  }
}

main().catch(console.error);
