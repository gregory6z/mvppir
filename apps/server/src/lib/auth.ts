import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "./prisma";
import { generateUniqueReferralCode } from "./generate-referral-code";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  plugins: [bearer()],
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
  trustedOrigins: process.env.NODE_ENV === "development"
    ? [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:3001", // PWA development
        "http://localhost:5173", // Vite default port
        "http://localhost:3333",
        "http://127.0.0.1:3333",
        "http://192.168.1.4:3333", // Mobile app (local network IP - old)
        "http://192.168.1.122:3333", // Mobile app (local network IP - current)
        "http://0.0.0.0:3333",
      ]
    : [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:3001", // PWA development
        "http://localhost:5173", // Vite default port
        "https://mvppir-pwa.vercel.app", // PWA production
        "https://mvppir-web-o3i5.vercel.app", // Admin web production
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

  // Advanced options for cookie configuration
  advanced: {
    // Always use secure cookies when not in development (HTTPS required)
    useSecureCookies: process.env.NODE_ENV !== "development",
    // TODO: [VPS Migration] Mudar para "lax" quando frontend e API estiverem no mesmo domínio
    // Atualmente "none" é OBRIGATÓRIO porque Vercel (.vercel.app) e Railway (.railway.app) são domínios diferentes
    // Após migrar para VPS com mesmo domínio (ex: api.stakly.com + app.stakly.com), usar "lax" que é mais seguro
    cookieSameSite: "none" as const,
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

          // 1.1. Create deposit address automatically
          try {
            const { Wallet } = await import("ethers");
            const { encryptPrivateKey } = await import("./encryption");

            const wallet = Wallet.createRandom();
            const encryptedKey = encryptPrivateKey(wallet.privateKey);

            await prisma.depositAddress.create({
              data: {
                userId: user.id,
                polygonAddress: wallet.address.toLowerCase(),
                privateKey: encryptedKey,
                status: "ACTIVE",
              },
            });

            console.log(`✅ Created deposit address for ${user.name}: ${wallet.address.toLowerCase()}`);
          } catch (error) {
            console.error(`❌ Failed to create deposit address for user ${user.id}:`, error);
            // Don't block user creation if address generation fails
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
