import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { generateUniqueReferralCode } from "./generate-referral-code";

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

  // Include role in user response
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // don't allow user to set role
      },
      status: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Atualiza a cada 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos
    },
  },

  // Database hooks para processar referral code e gerar código próprio
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => {
          console.log(`🆕 New user created: ${user.id} (${user.email})`);

          // 1. Generate unique referral code for new user
          try {
            const newReferralCode = await generateUniqueReferralCode(user.name);

            await prisma.user.update({
              where: { id: user.id },
              data: { referralCode: newReferralCode },
            });

            console.log(`✅ Generated referral code for ${user.name}: ${newReferralCode}`);
          } catch (error) {
            console.error(`❌ Failed to generate referral code for user ${user.id}:`, error);
            // Don't block user creation if code generation fails
          }

          // 2. Process referral code (link to referrer) if provided
          if (!context) {
            return;
          }

          const body = context.body as any;
          const referralCode = body?.referralCode;

          if (!referralCode) {
            console.log(`ℹ️  No referral code provided for user ${user.id}`);
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

          // Increment referrer's totalDirects count
          await prisma.user.update({
            where: { id: referrer.id },
            data: { totalDirects: { increment: 1 } },
          });

          console.log(
            `✅ User ${user.id} (${user.email}) linked to referrer ${referrer.id} via code ${referralCode}`
          );
          console.log(`✅ Referrer ${referrer.id} totalDirects incremented`);
        },
      },
    },
  },
});
