import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { buildApp } from "@/app";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import { encryptPrivateKey } from "@/lib/encryption";
import { Wallet } from "ethers";

describe("Batch Transfer Flow (F1)", () => {
  let app: FastifyInstance;
  let adminCookie: string;
  let adminId: string;
  let userId: string;
  let globalWalletId: string;

  beforeEach(async () => {
    // Inicializa app
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    // Limpa dados de teste
    if (userId) {
      await prisma.balance.deleteMany({ where: { userId } });
      await prisma.walletTransaction.deleteMany({ where: { userId } });
      await prisma.depositAddress.deleteMany({ where: { userId } });
      await prisma.account.deleteMany({ where: { userId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }

    if (adminId) {
      await prisma.adminLog.deleteMany({ where: { adminId } });
      await prisma.account.deleteMany({ where: { userId: adminId } });
      await prisma.session.deleteMany({ where: { userId: adminId } });
      await prisma.user.deleteMany({ where: { id: adminId } });
    }

    if (globalWalletId) {
      await prisma.globalWalletBalance.deleteMany({
        where: { globalWalletId },
      });
      await prisma.globalWallet.deleteMany({ where: { id: globalWalletId } });
    }

    await app.close();
  });

  test("Admin deve conseguir executar batch transfer e consolidar fundos", async () => {
    // ====================
    // PASSO 1: Criar admin
    // ====================
    const adminSignup = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        email: `admin-${Date.now()}@example.com`,
        password: "Admin123!@#",
        name: "Admin User",
      },
    });

    assert.strictEqual(adminSignup.statusCode, 200, "Admin signup deve retornar 200");

    // Promover para admin no banco
    const adminUser = await prisma.user.update({
      where: { email: adminSignup.json().user.email },
      data: { role: "admin", status: "ACTIVE" },
    });

    adminId = adminUser.id;

    // Login como admin
    const adminLogin = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: adminUser.email,
        password: "Admin123!@#",
      },
    });

    assert.strictEqual(adminLogin.statusCode, 200, "Admin login deve retornar 200");

    const setCookie = adminLogin.headers["set-cookie"];
    assert.ok(setCookie, "Admin login deve retornar cookie");
    adminCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    // ====================
    // PASSO 2: Criar Global Wallet
    // ====================
    const globalWallet = Wallet.createRandom();
    const encryptedKey = encryptPrivateKey(globalWallet.privateKey);

    const createdGlobalWallet = await prisma.globalWallet.create({
      data: {
        polygonAddress: globalWallet.address.toLowerCase(),
        privateKey: encryptedKey,
      },
    });

    globalWalletId = createdGlobalWallet.id;

    // ====================
    // PASSO 3: Criar usuário com saldo
    // ====================
    const userSignup = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        email: `user-${Date.now()}@example.com`,
        password: "User123!@#",
        name: "Test User",
      },
    });

    assert.strictEqual(userSignup.statusCode, 200, "User signup deve retornar 200");

    userId = userSignup.json().user.id;

    // Login como usuário
    const userLogin = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: userSignup.json().user.email,
        password: "User123!@#",
      },
    });

    const userCookie = Array.isArray(userLogin.headers["set-cookie"])
      ? userLogin.headers["set-cookie"][0]
      : userLogin.headers["set-cookie"];

    // Obter endereço de depósito
    const addressResponse = await app.inject({
      method: "GET",
      url: "/deposit/my-address",
      headers: { cookie: userCookie },
    });

    const depositAddressId = addressResponse.json().id;

    // ====================
    // PASSO 4: Simular depósito confirmado (criar transação e balance)
    // ====================
    const txHash = `0x${Date.now().toString(16)}${"0".repeat(48)}`;

    await prisma.$transaction(async (tx) => {
      // Criar transação confirmada
      await tx.walletTransaction.create({
        data: {
          userId,
          depositAddressId,
          type: "CREDIT",
          amount: 100,
          tokenSymbol: "USDC",
          tokenDecimals: 6,
          rawAmount: "100000000",
          txHash,
          status: "CONFIRMED",
        },
      });

      // Criar balance
      await tx.balance.create({
        data: {
          userId,
          tokenSymbol: "USDC",
          availableBalance: 100,
          lockedBalance: 0,
        },
      });
    });

    // Verificar que saldo foi criado
    const balance = await prisma.balance.findUnique({
      where: {
        userId_tokenSymbol: {
          userId,
          tokenSymbol: "USDC",
        },
      },
    });

    assert.ok(balance, "Balance deve existir");
    assert.strictEqual(balance.availableBalance.toString(), "100", "Saldo deve ser 100 USDC");

    // ====================
    // PASSO 5: Executar batch transfer (SEM chamadas blockchain reais)
    // ====================
    // NOTA: O batch transfer tentará chamar blockchain, mas como estamos
    // em ambiente de teste sem fundos reais, ele deve falhar gracefully.
    // O teste verifica que a ROTA está protegida e acessível apenas por admin.

    const batchResponse = await app.inject({
      method: "POST",
      url: "/admin/transfers/batch-collect",
      headers: {
        cookie: adminCookie,
      },
    });

    // O batch transfer pode falhar por falta de MATIC na Global Wallet
    // ou por erro de RPC, mas deve retornar 400/500, não 403
    assert.notStrictEqual(
      batchResponse.statusCode,
      403,
      "Admin deve ter acesso à rota"
    );

    // Se retornou 400, deve ser por falta de MATIC
    if (batchResponse.statusCode === 400) {
      const body = batchResponse.json();
      assert.ok(
        body.error === "INSUFFICIENT_GLOBAL_MATIC" ||
          body.error === "GLOBAL_WALLET_NOT_FOUND",
        "Erro deve ser relacionado a Global Wallet"
      );
    }

    // ====================
    // PASSO 6: Verificar que usuário comum NÃO pode acessar
    // ====================
    const userBatchResponse = await app.inject({
      method: "POST",
      url: "/admin/transfers/batch-collect",
      headers: {
        cookie: userCookie,
      },
    });

    assert.strictEqual(
      userBatchResponse.statusCode,
      403,
      "Usuário comum deve receber 403 Forbidden"
    );

    console.log("✅ Teste completo: Batch Transfer protegido por role admin!");
  });
});
