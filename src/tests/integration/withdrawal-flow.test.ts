import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { buildApp } from "@/app";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import { encryptPrivateKey } from "@/lib/encryption";
import { Wallet } from "ethers";

describe("Withdrawal Flow (F2)", () => {
  let app: FastifyInstance;
  let userCookie: string;
  let adminCookie: string;
  let userId: string;
  let adminId: string;
  let globalWalletId: string;

  beforeEach(async () => {
    // Inicializa app
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    // Limpa dados de teste
    if (userId) {
      await prisma.withdrawalNotification.deleteMany({ where: { userId } });
      await prisma.withdrawal.deleteMany({ where: { userId } });
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

  test("Fluxo completo: Usuário solicita → Admin aprova → Sistema processa (ou falha)", async () => {
    // ====================
    // PASSO 1: Criar usuário
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

    // Ativar usuário
    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    // Login como usuário
    const userLogin = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: userSignup.json().user.email,
        password: "User123!@#",
      },
    });

    const setCookie = userLogin.headers["set-cookie"];
    assert.ok(setCookie, "User login deve retornar cookie");
    userCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    // ====================
    // PASSO 2: Criar admin
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

    adminId = adminSignup.json().user.id;

    // Promover para admin
    await prisma.user.update({
      where: { id: adminId },
      data: { role: "admin", status: "ACTIVE" },
    });

    // Login como admin
    const adminLogin = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: adminSignup.json().user.email,
        password: "Admin123!@#",
      },
    });

    const adminSetCookie = adminLogin.headers["set-cookie"];
    assert.ok(adminSetCookie, "Admin login deve retornar cookie");
    adminCookie = Array.isArray(adminSetCookie)
      ? adminSetCookie[0]
      : adminSetCookie;

    // ====================
    // PASSO 3: Criar Global Wallet
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
    // PASSO 4: Criar saldo para o usuário
    // ====================
    await prisma.balance.create({
      data: {
        userId,
        tokenSymbol: "USDC",
        availableBalance: 1000, // $1000 USDC
        lockedBalance: 0,
      },
    });

    // Verificar saldo
    const initialBalance = await prisma.balance.findUnique({
      where: {
        userId_tokenSymbol: { userId, tokenSymbol: "USDC" },
      },
    });

    assert.strictEqual(
      initialBalance?.availableBalance.toString(),
      "1000",
      "Saldo inicial deve ser 1000 USDC"
    );

    // ====================
    // PASSO 5: Usuário solicita saque
    // ====================
    const withdrawalRequest = await app.inject({
      method: "POST",
      url: "/user/withdrawals/request",
      headers: { cookie: userCookie },
      payload: {
        tokenSymbol: "USDC",
        amount: "500", // Sacar $500
        destinationAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB",
      },
    });

    assert.strictEqual(
      withdrawalRequest.statusCode,
      201,
      "Request withdrawal deve retornar 201"
    );

    const response = withdrawalRequest.json();
    assert.strictEqual(
      response.withdrawal.status,
      "PENDING_APPROVAL",
      "Status inicial deve ser PENDING_APPROVAL"
    );
    assert.strictEqual(
      response.withdrawal.amount,
      "500",
      "Valor deve ser 500 USDC"
    );

    const withdrawalId = response.withdrawal.id;

    // Verificar que saldo foi travado
    const balanceAfterRequest = await prisma.balance.findUnique({
      where: {
        userId_tokenSymbol: { userId, tokenSymbol: "USDC" },
      },
    });

    assert.strictEqual(
      balanceAfterRequest?.availableBalance.toString(),
      "500",
      "Saldo disponível deve ser 500 (1000 - 500)"
    );
    assert.strictEqual(
      balanceAfterRequest?.lockedBalance.toString(),
      "500",
      "Saldo travado deve ser 500"
    );

    // ====================
    // PASSO 6: Admin lista saques pendentes
    // ====================
    const listPending = await app.inject({
      method: "GET",
      url: "/admin/withdrawals?status=PENDING_APPROVAL",
      headers: { cookie: adminCookie },
    });

    assert.strictEqual(
      listPending.statusCode,
      200,
      "List pending deve retornar 200"
    );

    const pendingResponse = listPending.json();
    assert.ok(
      Array.isArray(pendingResponse.withdrawals),
      "Deve retornar array de saques"
    );
    assert.ok(
      pendingResponse.withdrawals.length > 0,
      "Deve ter pelo menos 1 saque pendente"
    );

    // ====================
    // PASSO 7: Admin aprova saque
    // ====================
    const approveResponse = await app.inject({
      method: "POST",
      url: `/admin/withdrawals/${withdrawalId}/approve`,
      headers: { cookie: adminCookie },
    });

    assert.strictEqual(
      approveResponse.statusCode,
      200,
      "Approve deve retornar 200"
    );

    const approvedResponse = approveResponse.json();
    assert.strictEqual(
      approvedResponse.withdrawal.status,
      "APPROVED",
      "Status deve ser APPROVED"
    );

    // Verificar AdminLog
    const adminLog = await prisma.adminLog.findFirst({
      where: {
        adminId,
        action: "APPROVE_WITHDRAWAL",
      },
    });

    assert.ok(adminLog, "AdminLog deve existir");
    assert.strictEqual(adminLog.action, "APPROVE_WITHDRAWAL", "Ação deve ser APPROVE_WITHDRAWAL");

    // ====================
    // PASSO 8: Verificar que saque foi aprovado
    // ====================
    // NOTA: Em modo de teste (SKIP_BLOCKCHAIN_PROCESSING=true), o processamento
    // blockchain não é executado. O teste verifica apenas que o fluxo de aprovação
    // funciona corretamente até este ponto.

    const finalWithdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    // Status deve ficar como APPROVED (processamento blockchain desabilitado em testes)
    assert.strictEqual(
      finalWithdrawal?.status,
      "APPROVED",
      `Status deve permanecer APPROVED em modo de teste, recebido: ${finalWithdrawal?.status}`
    );

    console.log("✅ Teste completo: Fluxo de saque validado com sucesso!");
  });

  test("Usuário NÃO deve conseguir sacar mais que o saldo disponível", async () => {
    // ====================
    // PASSO 1: Criar usuário
    // ====================
    const userSignup = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        email: `user2-${Date.now()}@example.com`,
        password: "User123!@#",
        name: "Test User 2",
      },
    });

    userId = userSignup.json().user.id;

    // Ativar usuário
    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    // Login
    const userLogin = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: userSignup.json().user.email,
        password: "User123!@#",
      },
    });

    const setCookie = userLogin.headers["set-cookie"];
    assert.ok(setCookie, "User login deve retornar cookie");
    userCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    // ====================
    // PASSO 2: Criar saldo de apenas 100 USDC
    // ====================
    await prisma.balance.create({
      data: {
        userId,
        tokenSymbol: "USDC",
        availableBalance: 100,
        lockedBalance: 0,
      },
    });

    // ====================
    // PASSO 3: Tentar sacar 500 USDC (mais que o saldo)
    // ====================
    const withdrawalRequest = await app.inject({
      method: "POST",
      url: "/user/withdrawals/request",
      headers: { cookie: userCookie },
      payload: {
        tokenSymbol: "USDC",
        amount: "500",
        destinationAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB",
      },
    });

    assert.strictEqual(
      withdrawalRequest.statusCode,
      400,
      "Deve retornar 400 Bad Request"
    );

    const error = withdrawalRequest.json();
    assert.strictEqual(
      error.error,
      "INSUFFICIENT_BALANCE",
      "Erro deve ser INSUFFICIENT_BALANCE"
    );

    console.log("✅ Teste completo: Validação de saldo insuficiente funcionando!");
  });

  test("Admin deve conseguir rejeitar saque pendente", async () => {
    // ====================
    // PASSO 1: Criar usuário e admin
    // ====================
    const userSignup = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        email: `user3-${Date.now()}@example.com`,
        password: "User123!@#",
        name: "Test User 3",
      },
    });

    userId = userSignup.json().user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    const userLogin = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: userSignup.json().user.email,
        password: "User123!@#",
      },
    });

    const userSetCookie2 = userLogin.headers["set-cookie"];
    assert.ok(userSetCookie2, "User login deve retornar cookie");
    userCookie = Array.isArray(userSetCookie2)
      ? userSetCookie2[0]
      : userSetCookie2;

    const adminSignup = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        email: `admin2-${Date.now()}@example.com`,
        password: "Admin123!@#",
        name: "Admin User 2",
      },
    });

    adminId = adminSignup.json().user.id;

    await prisma.user.update({
      where: { id: adminId },
      data: { role: "admin", status: "ACTIVE" },
    });

    const adminLogin = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: {
        email: adminSignup.json().user.email,
        password: "Admin123!@#",
      },
    });

    const adminSetCookie2 = adminLogin.headers["set-cookie"];
    assert.ok(adminSetCookie2, "Admin login deve retornar cookie");
    adminCookie = Array.isArray(adminSetCookie2)
      ? adminSetCookie2[0]
      : adminSetCookie2;

    // ====================
    // PASSO 2: Criar saldo e solicitar saque
    // ====================
    await prisma.balance.create({
      data: {
        userId,
        tokenSymbol: "USDC",
        availableBalance: 1000,
        lockedBalance: 0,
      },
    });

    const withdrawalRequest = await app.inject({
      method: "POST",
      url: "/user/withdrawals/request",
      headers: { cookie: userCookie },
      payload: {
        tokenSymbol: "USDC",
        amount: "500",
        destinationAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB",
      },
    });

    const withdrawalId = withdrawalRequest.json().withdrawal.id;

    // ====================
    // PASSO 3: Admin rejeita saque
    // ====================
    const rejectResponse = await app.inject({
      method: "POST",
      url: `/admin/withdrawals/${withdrawalId}/reject`,
      headers: { cookie: adminCookie },
      payload: {
        reason: "Documento não enviado",
      },
    });

    assert.strictEqual(rejectResponse.statusCode, 200, "Reject deve retornar 200");

    const rejectedResponse = rejectResponse.json();
    assert.strictEqual(
      rejectedResponse.withdrawal.status,
      "REJECTED",
      "Status deve ser REJECTED"
    );

    // ====================
    // PASSO 4: Verificar que saldo foi devolvido
    // ====================
    const finalBalance = await prisma.balance.findUnique({
      where: {
        userId_tokenSymbol: { userId, tokenSymbol: "USDC" },
      },
    });

    assert.strictEqual(
      finalBalance?.availableBalance.toString(),
      "1000",
      "Saldo deve ter sido devolvido"
    );
    assert.strictEqual(
      finalBalance?.lockedBalance.toString(),
      "0",
      "Saldo travado deve ser 0"
    );

    // Verificar AdminLog
    const adminLog = await prisma.adminLog.findFirst({
      where: {
        adminId,
        action: "REJECT_WITHDRAWAL",
      },
    });

    assert.ok(adminLog, "AdminLog de rejeição deve existir");

    console.log("✅ Teste completo: Rejeição de saque funcionando corretamente!");
  });
});
