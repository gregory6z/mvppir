import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { buildApp } from "@/app";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";

describe("Withdrawal Retry System", () => {
  let app: FastifyInstance;
  let adminCookie: string;
  let userCookie: string;
  let userId: string;
  let adminId: string;

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

    await app.close();
  });

  test("Endpoint de retry deve ser protegido por role admin", async () => {
    // ====================
    // PASSO 1: Criar usuário comum
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

    const userSetCookie = userLogin.headers["set-cookie"];
    assert.ok(userSetCookie, "User login deve retornar cookie");
    userCookie = Array.isArray(userSetCookie) ? userSetCookie[0] : userSetCookie;

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

    const adminSetCookie = adminLogin.headers["set-cookie"];
    assert.ok(adminSetCookie, "Admin login deve retornar cookie");
    adminCookie = Array.isArray(adminSetCookie)
      ? adminSetCookie[0]
      : adminSetCookie;

    // ====================
    // PASSO 3: Criar withdrawal para teste
    // ====================
    await prisma.balance.create({
      data: {
        userId,
        tokenSymbol: "USDC",
        availableBalance: 0,
        lockedBalance: 500,
      },
    });

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        tokenSymbol: "USDC",
        amount: 500,
        fee: 0,
        destinationAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB",
        status: "FAILED",
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    const withdrawalId = withdrawal.id;

    // ====================
    // PASSO 4: Usuário comum NÃO deve ter acesso
    // ====================
    const userRetryResponse = await app.inject({
      method: "POST",
      url: `/admin/withdrawals/${withdrawalId}/retry`,
      headers: { cookie: userCookie },
    });

    assert.strictEqual(
      userRetryResponse.statusCode,
      403,
      "Usuário comum deve receber 403 Forbidden"
    );

    const userError = userRetryResponse.json();
    assert.strictEqual(userError.error, "FORBIDDEN", "Erro deve ser FORBIDDEN");

    // ====================
    // PASSO 5: Admin deve ter acesso (mas pode falhar por outros motivos)
    // ====================
    const adminRetryResponse = await app.inject({
      method: "POST",
      url: `/admin/withdrawals/${withdrawalId}/retry`,
      headers: { cookie: adminCookie },
    });

    // Admin não recebe 403, mas pode receber 400/500 por outros motivos
    assert.notStrictEqual(
      adminRetryResponse.statusCode,
      403,
      "Admin deve ter acesso ao endpoint (não deve receber 403)"
    );

    console.log("✅ Teste completo: Retry endpoint protegido por role admin!");
  });
});
