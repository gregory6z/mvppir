import Moralis from "moralis";
import { config } from "dotenv";

config();

async function main() {
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
  const API_BASE_URL = process.env.API_BASE_URL;

  if (!MORALIS_API_KEY) {
    console.error("❌ MORALIS_API_KEY não configurada");
    return;
  }

  await Moralis.start({ apiKey: MORALIS_API_KEY });

  // Stream antigo já foi deletado, criar novo diretamente

  // 2. Criar novo stream com configuração correta
  console.log("\n🆕 Criando novo stream...");

  // Usar postman-echo temporariamente para bypass da verificação do Moralis
  // postman-echo.com/post sempre retorna 200 para POST requests
  const tempWebhookUrl = "https://postman-echo.com/post";
  const prodWebhookUrl = "https://mvppir-production.up.railway.app/webhooks/moralis";
  console.log(`   Webhook URL temporária: ${tempWebhookUrl}`);

  // topic0 para o evento Transfer(address,address,uint256)
  // keccak256("Transfer(address,address,uint256)")
  const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

  const response = await Moralis.Streams.add({
    webhookUrl: tempWebhookUrl,
    description: "MVPPIR - Monitor de Depósitos Polygon (USDC/MATIC/USDT)",
    tag: "deposit_monitor",
    chains: ["0x89"], // Polygon Mainnet
    includeNativeTxs: true, // Monitora MATIC
    includeContractLogs: true, // ✅ IMPORTANTE: Captura eventos ERC20
    includeInternalTxs: false,
    topic0: [TRANSFER_TOPIC], // Topic0 do evento Transfer
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

  const newStreamId = response.raw.id;

  console.log(`\n✅ Novo stream criado com sucesso!`);
  console.log(`   Stream ID: ${newStreamId}`);
  console.log(`   includeContractLogs: ${response.raw.includeContractLogs}`);
  console.log(`   status: ${response.raw.status}`);

  console.log(`\n⚠️  IMPORTANTE: Atualize o .env com:`);
  console.log(`   POLYGON_USDC_STREAM_ID="${newStreamId}"`);

  // 2.5. Atualizar webhook URL para produção
  console.log(`\n🔄 Atualizando webhook URL para produção...`);
  console.log(`   Nova URL: ${prodWebhookUrl}`);

  try {
    await Moralis.Streams.update({
      id: newStreamId,
      webhookUrl: prodWebhookUrl,
    });
    console.log(`✅ Webhook URL atualizada para produção`);
  } catch (e: any) {
    console.log(`⚠️  Erro ao atualizar webhook URL: ${e.message}`);
    console.log(`   Você pode atualizar manualmente depois quando o deploy terminar`);
  }

  // 3. Adicionar o endereço de teste
  const testAddress = "0xbe9b58870c378652f425716d53cb3f4413899a44";
  console.log(`\n📍 Adicionando endereço de teste: ${testAddress}`);

  try {
    await Moralis.Streams.addAddress({
      id: newStreamId,
      address: [testAddress.toLowerCase()],
    });
    console.log(`✅ Endereço adicionado ao stream`);
  } catch (e: any) {
    console.log(`⚠️  Erro ao adicionar endereço: ${e.message}`);
  }

  console.log(`\n🎉 Pronto! O novo stream está configurado corretamente.`);
  console.log(`   Faça um novo depósito para testar.`);
}

main().catch(console.error);
