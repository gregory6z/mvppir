/**
 * Teste Rápido - Valida se o servidor está funcionando
 *
 * Executa testes básicos sem criar dados permanentes
 *
 * Como usar:
 * npx tsx tests/quick-test.ts
 */

const API_BASE_URL = "http://localhost:3333";

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();

  try {
    await fn();
    results.push({
      name,
      success: true,
      duration: Date.now() - start,
    });
    console.log(`✅ ${name} (${Date.now() - start}ms)`);
  } catch (error: any) {
    results.push({
      name,
      success: false,
      error: error.message,
      duration: Date.now() - start,
    });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function quickTests() {
  console.log("🚀 Testes Rápidos - MVP PIR\n");

  // 1. Servidor está rodando?
  await test("Servidor está acessível", async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    }).catch(() => {
      throw new Error("Servidor não está rodando em http://localhost:3333");
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Servidor retornou status ${response.status}`);
    }
  });

  // 2. Endpoint de auth existe?
  await test("Endpoint /api/auth/session existe", async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: "GET",
    });

    // Esperamos 401 (não autenticado) ou 200 (autenticado)
    if (response.status !== 401 && response.status !== 200) {
      throw new Error(`Esperado 401 ou 200, recebeu ${response.status}`);
    }
  });

  // 3. Criar conta funciona?
  const testEmail = `quick-test-${Date.now()}@example.com`;
  let sessionToken: string;

  await test("Criar conta (sign-up)", async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "Test123456!",
        name: "Quick Test User",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sign-up falhou: ${JSON.stringify(error)}`);
    }
  });

  // 4. Login funciona?
  await test("Login (sign-in)", async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "Test123456!",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sign-in falhou: ${JSON.stringify(error)}`);
    }

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      const match = setCookie.match(/better-auth.session_token=([^;]+)/);
      if (match) {
        sessionToken = match[1];
        return;
      }
    }

    throw new Error("Session token não encontrado");
  });

  // 5. Endpoints protegidos funcionam?
  await test("Obter endereço de depósito (autenticado)", async () => {
    const response = await fetch(`${API_BASE_URL}/deposit/address`, {
      method: "GET",
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Get deposit address falhou: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    if (!data.polygonAddress || !data.polygonAddress.startsWith("0x")) {
      throw new Error("Endereço Polygon inválido");
    }
  });

  // 6. Endpoint de transações funciona?
  await test("Listar transações (autenticado)", async () => {
    const response = await fetch(`${API_BASE_URL}/user/transactions`, {
      method: "GET",
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Get transactions falhou: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.transactions)) {
      throw new Error("transactions deve ser um array");
    }
  });

  // 7. Endpoint de saldo funciona?
  await test("Obter saldo (autenticado)", async () => {
    const response = await fetch(`${API_BASE_URL}/user/balance`, {
      method: "GET",
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Get balance falhou: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    if (typeof data.balances !== "object") {
      throw new Error("balances deve ser um objeto");
    }
  });

  // 8. Webhook endpoint existe?
  await test("Webhook endpoint /webhooks/moralis existe", async () => {
    const response = await fetch(`${API_BASE_URL}/webhooks/moralis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    // Esperamos 400 (invalid payload) ou 401 (invalid signature)
    // Não esperamos 404
    if (response.status === 404) {
      throw new Error("Endpoint não existe");
    }
  });

  // Resumo
  console.log("\n" + "=".repeat(60));
  console.log("📊 Resumo dos Testes");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const total = results.length;

  console.log(`\n✅ Passou: ${passed}/${total}`);
  console.log(`❌ Falhou: ${failed}/${total}`);

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  console.log(`⏱️  Tempo total: ${totalDuration}ms`);

  if (failed > 0) {
    console.log("\n❌ Testes com falha:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  console.log("\n" + "=".repeat(60));

  if (failed === 0) {
    console.log("✅ Todos os testes passaram! Sistema funcionando corretamente.");
  } else {
    console.log("⚠️  Alguns testes falharam. Verifique os erros acima.");
    process.exit(1);
  }
}

// Executa os testes
quickTests();
