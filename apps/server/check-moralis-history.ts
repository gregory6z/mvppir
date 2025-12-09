import Moralis from "moralis";
import { config } from "dotenv";

// Carrega variáveis do .env
config();

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const STREAM_ID = process.env.POLYGON_USDC_STREAM_ID;

async function main() {
  if (!MORALIS_API_KEY) {
    console.error("❌ MORALIS_API_KEY não configurada");
    return;
  }

  console.log("🔍 Conectando ao Moralis...");

  await Moralis.start({ apiKey: MORALIS_API_KEY });

  // Lista todos os streams
  console.log("\n📡 Streams configurados:");
  const streams = await Moralis.Streams.getAll({ limit: 10 });

  for (const stream of streams.result) {
    console.log(`\n  Stream ID: ${stream.id}`);
    console.log(`  Tag: ${stream.tag}`);
    console.log(`  Status: ${stream.status}`);
    console.log(`  Webhook URL: ${stream.webhookUrl}`);

    // Busca endereços monitorados
    const addresses = await Moralis.Streams.getAddresses({ id: stream.id, limit: 100 });
    console.log(`  Endereços monitorados: ${addresses.result.length}`);

    // Verifica se o endereço de teste está sendo monitorado
    const targetAddress = "0xbe9b58870c378652f425716d53cb3f4413899a44".toLowerCase();
    console.log(`\n  📍 Endereços no stream:`);
    for (const a of addresses.result) {
      console.log(`     - ${JSON.stringify(a)}`);
    }
    const isMonitored = addresses.result.some((a: any) => {
      const addr = a?.address?.checksum || a?.address || a;
      return String(addr).toLowerCase() === targetAddress;
    });
    console.log(`\n  Endereço ${targetAddress} monitorado: ${isMonitored ? "✅ SIM" : "❌ NÃO"}`);

    // Busca histórico de webhooks (se disponível)
    try {
      const history = await Moralis.Streams.getHistory({
        limit: 10,
      });
      console.log(`\n  📜 Últimos webhooks enviados:`);
      if (history.result.length === 0) {
        console.log("     Nenhum webhook recente");
      } else {
        for (const h of history.result) {
          console.log(`     - ID: ${h.id}`);
          console.log(`       Data: ${h.createdAt}`);
          console.log(`       Delivered: ${h.delivered}`);
          console.log(`       Error: ${h.errorMessage || 'none'}`);
          console.log(`       ---`);
        }
      }
    } catch (e: any) {
      console.log(`  ⚠️  Não foi possível buscar histórico: ${e.message}`);
    }
  }
}

main().catch(console.error);
