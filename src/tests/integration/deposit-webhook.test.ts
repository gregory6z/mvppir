import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { buildApp } from "@/app";
import { prisma } from "@/lib/prisma";
import { keccak256 } from "ethers";
import type { FastifyInstance } from "fastify";

describe("Deposit + Webhook Flow", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let userId: string;

  beforeEach(async () => {
    // Inicializa app
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    // Limpa dados de teste
    if (userId) {
      await prisma.walletTransaction.deleteMany({
        where: { userId },
      });
      await prisma.depositAddress.deleteMany({
        where: { userId },
      });
      await prisma.account.deleteMany({
        where: { userId },
      });
      await prisma.session.deleteMany({
        where: { userId },
      });
      await prisma.user.deleteMany({
        where: { id: userId },
      });
    }

    await app.close();
  });

  test("Deve processar depósito via webhook e criar transação", async () => {
    // ====================
    // PASSO 1: Criar conta
    // ====================
    const signupResponse = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        email: `test-${Date.now()}@example.com`,
        password: "Test123!@#",
        name: "Test User",
      },
    });

    assert.strictEqual(
      signupResponse.statusCode,
      200,
      "Signup deve retornar 200"
    );

    // ====================
    // PASSO 2: Fazer login
    // ====================
    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: signupResponse.json().user.email,
        password: "Test123!@#",
      },
    });

    assert.strictEqual(loginResponse.statusCode, 200, "Login deve retornar 200");

    // Extrai cookie de autenticação
    const setCookie = loginResponse.headers["set-cookie"];
    assert.ok(setCookie, "Deve retornar cookie de autenticação");
    authCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    // Guarda userId para cleanup
    userId = loginResponse.json().user.id;

    // ===============================
    // PASSO 3: Obter endereço de depósito
    // ===============================
    const addressResponse = await app.inject({
      method: "GET",
      url: "/deposit/my-address",
      headers: {
        cookie: authCookie,
      },
    });

    assert.strictEqual(
      addressResponse.statusCode,
      200,
      "Get address deve retornar 200"
    );

    const addressData = addressResponse.json();
    assert.ok(addressData.polygonAddress, "Deve retornar endereço Polygon");
    assert.ok(addressData.qrCode, "Deve retornar QR Code");
    assert.strictEqual(addressData.status, "ACTIVE", "Endereço deve estar ativo");

    const depositAddress = addressData.polygonAddress;

    // ================================
    // PASSO 4: Simular webhook Moralis (não confirmado)
    // ================================
    const txHash = `0x${Date.now().toString(16)}${"0".repeat(48)}`;

    const webhookPayloadPending = {
      confirmed: false, // Ainda não confirmado
      chainId: "137",
      txHash,
      to: depositAddress,
      from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      value: "100000000", // 100 USDC (6 decimals)
      tokenAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
      tokenName: "USD Coin",
      tokenSymbol: "USDC",
      tokenDecimals: "6",
      block: {
        number: "12345678",
        timestamp: new Date().toISOString(),
      },
    };

    // Gera assinatura válida (Keccak256)
    const streamSecret = process.env.MORALIS_STREAM_SECRET;
    let data = JSON.stringify(webhookPayloadPending) + streamSecret;
    let signature = keccak256(Buffer.from(data));

    const pendingResponse = await app.inject({
      method: "POST",
      url: "/webhooks/moralis",
      headers: {
        "x-signature": signature,
        "content-type": "application/json",
      },
      payload: webhookPayloadPending,
    });

    assert.strictEqual(
      pendingResponse.statusCode,
      200,
      "Webhook PENDING deve retornar 200"
    );

    // Verifica que transação foi criada como PENDING
    let transaction = await prisma.walletTransaction.findUnique({
      where: { txHash },
    });

    assert.ok(transaction, "Transação PENDING deve existir");
    assert.strictEqual(transaction.status, "PENDING", "Status deve ser PENDING");

    // ================================
    // PASSO 5: Simular webhook de confirmação
    // ================================
    const webhookPayloadConfirmed = {
      ...webhookPayloadPending,
      confirmed: true, // Agora confirmado!
    };

    data = JSON.stringify(webhookPayloadConfirmed) + streamSecret;
    signature = keccak256(Buffer.from(data));

    const confirmedResponse = await app.inject({
      method: "POST",
      url: "/webhooks/moralis",
      headers: {
        "x-signature": signature,
        "content-type": "application/json",
      },
      payload: webhookPayloadConfirmed,
    });

    assert.strictEqual(
      confirmedResponse.statusCode,
      200,
      "Webhook CONFIRMED deve retornar 200"
    );

    // ===================================
    // PASSO 6: Verificar transação CONFIRMADA
    // ===================================
    transaction = await prisma.walletTransaction.findUnique({
      where: { txHash },
    });

    assert.ok(transaction, "Transação deve existir no banco");
    assert.strictEqual(transaction.userId, userId, "UserId deve corresponder");
    assert.strictEqual(transaction.type, "CREDIT", "Tipo deve ser CREDIT");
    assert.strictEqual(
      transaction.tokenSymbol,
      "USDC",
      "Token deve ser USDC"
    );
    assert.strictEqual(
      transaction.amount.toString(),
      "100",
      "Valor deve ser 100"
    );
    assert.strictEqual(
      transaction.status,
      "CONFIRMED",
      "Status deve ser CONFIRMED após webhook de confirmação"
    );
    assert.strictEqual(
      transaction.txHash,
      txHash,
      "TxHash deve corresponder"
    );

    console.log("✅ Teste completo: Depósito + Webhook processado com sucesso!");
  });
});
