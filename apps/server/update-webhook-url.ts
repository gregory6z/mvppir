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
  const prodWebhookUrl = "https://mvppir-production.up.railway.app/webhooks/moralis";

  console.log("🔄 Atualizando webhook URL para produção...");
  console.log(`   Stream ID: ${streamId}`);
  console.log(`   Nova URL: ${prodWebhookUrl}`);

  try {
    await Moralis.Streams.update({
      id: streamId,
      webhookUrl: prodWebhookUrl,
    });
    console.log(`✅ Webhook URL atualizada com sucesso!`);
  } catch (e: any) {
    console.log(`❌ Erro ao atualizar webhook URL: ${e.message}`);
    console.log(`\n   O Railway ainda não fez deploy com o código atualizado.`);
    console.log(`   Aguarde alguns minutos e tente novamente.`);
  }
}

main().catch(console.error);
