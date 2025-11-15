/**
 * Script de teste para conexão direta com Moralis
 * Verifica API Key, lista Streams existentes e testa criação
 */

import Moralis from "moralis";
import "dotenv/config";

async function testMoralisConnection() {
  console.log("🔍 Testando conexão com Moralis...\n");

  const apiKey = process.env.MORALIS_API_KEY;
  const webhookUrl = process.env.API_BASE_URL
    ? `${process.env.API_BASE_URL}/webhooks/moralis`
    : "https://mvppir-production.up.railway.app/webhooks/moralis";

  if (!apiKey) {
    console.error("❌ MORALIS_API_KEY não configurada no .env");
    process.exit(1);
  }

  console.log("📋 Configuração:");
  console.log(`   API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`);
  console.log(`   Webhook URL: ${webhookUrl}\n`);

  try {
    // 1. Inicializar Moralis
    console.log("1️⃣ Inicializando Moralis...");
    await Moralis.start({ apiKey });
    console.log("   ✅ Moralis inicializado com sucesso\n");

    // 2. Listar Streams existentes
    console.log("2️⃣ Listando Streams existentes...");
    const streams = await Moralis.Streams.getAll({ limit: 100 });

    console.log(`   📊 Total de Streams: ${streams.raw.total}`);

    if (streams.raw.result.length === 0) {
      console.log("   ℹ️  Nenhum Stream encontrado\n");
    } else {
      console.log("\n   Streams encontrados:");
      streams.raw.result.forEach((stream: any, index: number) => {
        console.log(`\n   Stream #${index + 1}:`);
        console.log(`   - ID: ${stream.id}`);
        console.log(`   - Tag: ${stream.tag}`);
        console.log(`   - Description: ${stream.description}`);
        console.log(`   - Webhook URL: ${stream.webhookUrl}`);
        console.log(`   - Status: ${stream.status}`);
        console.log(`   - Chains: ${stream.chainIds?.join(", ")}`);
        console.log(`   - Endereços monitorados: ${stream.addresses?.length || 0}`);
      });
      console.log("");
    }

    // 3. Verificar se existe Stream para Polygon
    const polygonStream = streams.raw.result.find((s: any) =>
      s.chainIds?.includes("0x89") && s.tag === "deposit_monitor"
    );

    if (polygonStream) {
      console.log("3️⃣ Stream Polygon encontrado:");
      console.log(`   - ID: ${polygonStream.id}`);
      console.log(`   - Webhook Secret configurado: ${polygonStream.webhookUrl ? 'Sim' : 'Não'}`);
      console.log(`   - Endereços monitorados: ${polygonStream.addresses?.length || 0}`);

      if (polygonStream.addresses && polygonStream.addresses.length > 0) {
        console.log("\n   Primeiros 5 endereços:");
        polygonStream.addresses.slice(0, 5).forEach((addr: string) => {
          console.log(`   - ${addr}`);
        });
      }

      console.log(`\n   ⚠️  Adicione ao .env:`);
      console.log(`   POLYGON_USDC_STREAM_ID="${polygonStream.id}"`);
    } else {
      console.log("3️⃣ Nenhum Stream Polygon encontrado");
      console.log("   ℹ️  Você pode criar um manualmente no dashboard:");
      console.log("   https://admin.moralis.io/streams");
      console.log("\n   Ou deixar o sistema criar automaticamente na primeira solicitação de endereço.");
    }

    console.log("\n✅ Teste concluído com sucesso!");

  } catch (error: any) {
    console.error("\n❌ Erro ao conectar com Moralis:");
    console.error(`   Mensagem: ${error.message}`);

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    if (error.message.includes("Invalid API key")) {
      console.error("\n   💡 A API Key parece estar inválida.");
      console.error("   Verifique em: https://admin.moralis.io/settings");
    }

    process.exit(1);
  }
}

testMoralisConnection();
