import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    // Configuração dos provedores OAuth será adicionada conforme necessário
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
  ],
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.API_BASE_URL || "http://localhost:3333",

  // Hook para adicionar role ao session
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Atualiza a cada 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos
    },
  },

  // Database hooks para processar referral code
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => {
          // Check if context is available
          if (!context) {
            return;
          }

          // Extract referral code from request context
          const body = context.body as any;
          const referralCode = body?.referralCode;

          if (!referralCode) {
            return; // No referral code provided
          }

          console.log(`🔍 Processing referral code: ${referralCode} for user ${user.id}`);

          // Find referrer by referral code
          const referrer = await prisma.user.findUnique({
            where: { referralCode: referralCode.toUpperCase() },
            select: { id: true, status: true },
          });

          console.log("🔍 Referrer found:", referrer);

          // Validate referrer exists and is ACTIVE
          if (!referrer || referrer.status !== "ACTIVE") {
            console.warn(`❌ Invalid or inactive referral code: ${referralCode}`);
            return; // Don't block user creation
          }

          // Update new user with referrerId
          await prisma.user.update({
            where: { id: user.id },
            data: { referrerId: referrer.id },
          });

          console.log(
            `✅ User ${user.id} (${user.email}) linked to referrer ${referrer.id} via code ${referralCode}`
          );
        },
      },
    },
  },
});
