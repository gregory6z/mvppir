/**
 * Script para criar o Moralis Stream via API
 * Alternativa ao dashboard quando ele não aceita o webhook
 */

import Moralis from "moralis";
import "dotenv/config";

async function createMoralisStream() {
  console.log("🚀 Criando Moralis Stream via API...\n");

  const apiKey = process.env.MORALIS_API_KEY;
  const webhookUrl =
    "https://mvppir-production.up.railway.app/webhooks/moralis";
  const webhookSecret = process.env.MORALIS_STREAM_SECRET || "mvppir-webhook-secret-production-2025";

  if (!apiKey) {
    console.error("❌ MORALIS_API_KEY não configurada no .env");
    process.exit(1);
  }

  console.log("📋 Configuração:");
  console.log(`   Webhook URL: ${webhookUrl}`);
  console.log(`   Webhook Secret: ${webhookSecret.substring(0, 10)}...`);
  console.log("");

  try {
    // 1. Inicializar Moralis
    await Moralis.start({ apiKey });
    console.log("✅ Moralis inicializado\n");

    // 2. Criar o Stream (configurado para plano GRATUITO)
    console.log("📡 Criando Stream...");
    const stream = await Moralis.Streams.add({
      webhookUrl,
      description: "MVPPIR - Monitor de Depósitos Polygon",
      tag: "deposit_monitor",
      chains: ["0x89"], // Polygon Mainnet
      includeNativeTxs: true, // Monitora MATIC (transações nativas)
      includeInternalTxs: false, // Desabilitado (não precisa para depósitos)
      // includeAllTxLogs removido - não disponível no plano gratuito

      // ABI do evento Transfer do ERC20 (USDC, USDT, etc)
      abi: [
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

      // Topic0 do evento Transfer (hash do evento)
      topic0: ["Transfer(address,address,uint256)"],
    });

    const streamId = stream.raw.id;

    console.log("\n✅ Stream criado com sucesso!");
    console.log(`   Stream ID: ${streamId}`);
    console.log(`   Webhook URL: ${webhookUrl}`);
    console.log(`   Status: ${stream.raw.status || "active"}`);

    console.log("\n📝 Próximos passos:");
    console.log("\n1. Adicione ao .env (local e Railway):");
    console.log(`   POLYGON_USDC_STREAM_ID="${streamId}"`);
    console.log(`   MORALIS_STREAM_SECRET="${webhookSecret}"`);

    console.log("\n2. Agora quando um usuário criar endereço de depósito:");
    console.log("   - O sistema adiciona o endereço ao Stream automaticamente");
    console.log("   - Moralis começa a monitorar transações");
    console.log("   - Webhooks chegam em /webhooks/moralis");

    console.log("\n3. Para adicionar endereços manualmente:");
    console.log(`   npx tsx scripts/add-address-to-stream.ts 0x...`);

  } catch (error: any) {
    console.error("\n❌ Erro ao criar Stream:");
    console.error(`   ${error.message}`);

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    if (error.message.includes("already exists")) {
      console.log("\n💡 Stream já existe! Use:");
      console.log("   npx tsx scripts/test-moralis-connection.ts");
      console.log("   Para listar Streams existentes");
    }

    process.exit(1);
  }
}

createMoralisStream();
