/**
 * Script para testar o endpoint do webhook do Moralis
 * Simula o teste que o Moralis faz ao criar um Stream
 */

import "dotenv/config";

const WEBHOOK_URL = process.env.API_BASE_URL
  ? `${process.env.API_BASE_URL}/webhooks/moralis`
  : "https://mvppir-production.up.railway.app/webhooks/moralis";

async function testWebhookEndpoint() {
  console.log("🔍 Testando endpoint do webhook...\n");
  console.log(`   URL: ${WEBHOOK_URL}\n`);

  // Teste 1: GET request (health check)
  console.log("1️⃣ Testando GET (health check)...");
  try {
    const getResponse = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`   Status: ${getResponse.status}`);
    const getData = await getResponse.text();
    console.log(`   Response: ${getData}`);

    if (getResponse.status === 200) {
      console.log("   ✅ GET funcionando\n");
    } else {
      console.log(`   ❌ GET retornou ${getResponse.status}\n`);
    }
  } catch (error: any) {
    console.error(`   ❌ Erro no GET: ${error.message}\n`);
  }

  // Teste 2: POST com body vazio (teste do Moralis)
  console.log("2️⃣ Testando POST com body vazio (teste Moralis)...");
  try {
    const emptyPostResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    console.log(`   Status: ${emptyPostResponse.status}`);
    const emptyData = await emptyPostResponse.text();
    console.log(`   Response: ${emptyData}`);

    if (emptyPostResponse.status === 200) {
      console.log("   ✅ POST vazio funcionando (Moralis deveria aceitar)\n");
    } else {
      console.log(`   ❌ POST vazio retornou ${emptyPostResponse.status}\n`);
    }
  } catch (error: any) {
    console.error(`   ❌ Erro no POST vazio: ${error.message}\n`);
  }

  // Teste 3: POST com test: true
  console.log("3️⃣ Testando POST com test: true...");
  try {
    const testPostResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: true }),
    });

    console.log(`   Status: ${testPostResponse.status}`);
    const testData = await testPostResponse.text();
    console.log(`   Response: ${testData}`);

    if (testPostResponse.status === 200) {
      console.log("   ✅ POST test funcionando\n");
    } else {
      console.log(`   ❌ POST test retornou ${testPostResponse.status}\n`);
    }
  } catch (error: any) {
    console.error(`   ❌ Erro no POST test: ${error.message}\n`);
  }

  console.log("\n📋 Resumo:");
  console.log("   Se todos os testes passaram, o webhook está funcionando.");
  console.log("   Se algum falhou, verifique:");
  console.log("   - Servidor Railway está rodando?");
  console.log("   - URL está correta?");
  console.log("   - Firewall/CORS configurado?");
}

testWebhookEndpoint();
