/**
 * Teste do Fluxo Completo:
 * 1. Criar usuário
 * 2. Fazer login
 * 3. Obter endereço de depósito
 * 4. Simular webhook de depósito
 * 5. Verificar transações
 *
 * Como usar:
 * npx tsx tests/full-flow-test.ts
 */

import { keccak256 } from "ethers";

const API_BASE_URL = "http://localhost:3333";
const MORALIS_STREAM_SECRET = process.env.MORALIS_STREAM_SECRET!;

// Dados do usuário de teste
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: "Test123456!",
  name: "Test User",
};

let sessionToken: string;
let depositAddress: string;

/**
 * Cria uma conta de teste
 */
async function createAccount() {
  console.log("\n📝 Criando conta de teste...");

  const response = await fetch(`${API_BASE_URL}/api/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Falha ao criar conta: ${JSON.stringify(result)}`);
  }

  console.log(`✅ Conta criada: ${testUser.email}`);
  return result;
}

/**
 * Faz login e obtém session token
 */
async function signIn() {
  console.log("\n🔐 Fazendo login...");

  const response = await fetch(`${API_BASE_URL}/api/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Falha no login: ${JSON.stringify(result)}`);
  }

  // Extrai o session token dos headers ou cookies
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/better-auth.session_token=([^;]+)/);
    if (match) {
      sessionToken = match[1];
      console.log(`✅ Login realizado com sucesso`);
      return;
    }
  }

  throw new Error("Session token não encontrado");
}

/**
 * Obtém endereço de depósito
 */
async function getDepositAddress() {
  console.log("\n💳 Obtendo endereço de depósito...");

  const response = await fetch(`${API_BASE_URL}/deposit/address`, {
    method: "GET",
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Falha ao obter endereço: ${JSON.stringify(result)}`);
  }

  depositAddress = result.polygonAddress;
  console.log(`✅ Endereço de depósito: ${depositAddress}`);
  console.log(`📊 Dados completos:`, result);

  return result;
}

/**
 * Simula webhook do Moralis
 */
async function simulateDeposit(tokenType: "USDC" | "SHIB" | "MATIC") {
  console.log(`\n💰 Simulando depósito de ${tokenType}...`);

  let payload: any;

  switch (tokenType) {
    case "USDC":
      payload = {
        confirmed: true,
        chainId: "0x89",
        txHash: `0x${Date.now().toString(16)}${"0".repeat(40)}`,
        to: depositAddress,
        from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
        value: "5000000", // 5 USDC
        tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        tokenName: "USD Coin",
        tokenSymbol: "USDC",
        tokenDecimals: "6",
        block: {
          number: "12345678",
          timestamp: Math.floor(Date.now() / 1000).toString(),
        },
      };
      break;

    case "SHIB":
      payload = {
        confirmed: true,
        chainId: "0x89",
        txHash: `0x${Date.now().toString(16)}${"1".repeat(40)}`,
        to: depositAddress,
        from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
        value: "1000000000000000000", // 1 SHIB
        tokenAddress: "0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec",
        tokenName: "SHIBA INU",
        tokenSymbol: "SHIB",
        tokenDecimals: "18",
        block: {
          number: "12345679",
          timestamp: Math.floor(Date.now() / 1000).toString(),
        },
      };
      break;

    case "MATIC":
      payload = {
        confirmed: true,
        chainId: "0x89",
        txHash: `0x${Date.now().toString(16)}${"2".repeat(40)}`,
        to: depositAddress,
        from: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
        value: "2000000000000000000", // 2 MATIC
        block: {
          number: "12345680",
          timestamp: Math.floor(Date.now() / 1000).toString(),
        },
      };
      break;
  }

  const signature = keccak256(
    Buffer.from(JSON.stringify(payload) + MORALIS_STREAM_SECRET)
  );

  const response = await fetch(`${API_BASE_URL}/webhooks/moralis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signature": signature,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Falha no webhook: ${JSON.stringify(result)}`);
  }

  console.log(`✅ Depósito de ${tokenType} processado:`, result);
  return result;
}

/**
 * Lista transações do usuário
 */
async function getTransactions() {
  console.log("\n📋 Obtendo transações...");

  const response = await fetch(`${API_BASE_URL}/user/transactions`, {
    method: "GET",
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Falha ao obter transações: ${JSON.stringify(result)}`);
  }

  console.log(`✅ Total de transações: ${result.total}`);
  console.log(`📊 Transações:`, JSON.stringify(result.transactions, null, 2));

  return result;
}

/**
 * Obtém saldo do usuário
 */
async function getBalance() {
  console.log("\n💰 Obtendo saldo...");

  const response = await fetch(`${API_BASE_URL}/user/balance`, {
    method: "GET",
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Falha ao obter saldo: ${JSON.stringify(result)}`);
  }

  console.log(`✅ Saldos por token:`, result.balances);
  console.log(`📊 Total em USD:`, result.totalUSD || "N/A");

  return result;
}

/**
 * Executa o fluxo completo de testes
 */
async function runFullTest() {
  console.log("🚀 Iniciando teste do fluxo completo\n");
  console.log("=" .repeat(60));

  if (!MORALIS_STREAM_SECRET) {
    console.error("❌ MORALIS_STREAM_SECRET não configurado no .env");
    process.exit(1);
  }

  try {
    // 1. Criar conta
    await createAccount();

    // 2. Fazer login
    await signIn();

    // 3. Obter endereço de depósito
    await getDepositAddress();

    // 4. Simular depósitos
    await simulateDeposit("USDC");
    await new Promise((resolve) => setTimeout(resolve, 500));

    await simulateDeposit("SHIB");
    await new Promise((resolve) => setTimeout(resolve, 500));

    await simulateDeposit("MATIC");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5. Verificar transações
    await getTransactions();

    // 6. Verificar saldo
    await getBalance();

    console.log("\n" + "=".repeat(60));
    console.log("✅ Teste do fluxo completo concluído com sucesso!");
    console.log("=".repeat(60));
  } catch (error: any) {
    console.error("\n❌ Erro no teste:", error.message);
    process.exit(1);
  }
}

// Executa o teste
runFullTest();
