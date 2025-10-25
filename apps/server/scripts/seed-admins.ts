#!/usr/bin/env tsx
/**
 * Script para criar admins iniciais no sistema
 *
 * Uso:
 *   npx tsx scripts/seed-admins.ts
 *
 * Cria 4 admins com codenames:
 * - Alpha, Bravo, Charlie, Delta
 * - Emails: @admin.com
 * - Senha inicial: Admin@2025
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const ADMINS = [
  { name: "Alpha", email: "alpha@admin.com" },
  { name: "Bravo", email: "bravo@admin.com" },
  { name: "Charlie", email: "charlie@admin.com" },
  { name: "Delta", email: "delta@admin.com" },
];

const DEFAULT_PASSWORD = "Admin@2025";

async function seedAdmins() {
  console.log("🌱 Starting admin seeding...\n");

  // Hash da senha (bcrypt com salt rounds = 10, padrão do Better Auth)
  const hashedPassword = await hash(DEFAULT_PASSWORD, 10);

  for (const admin of ADMINS) {
    try {
      // Verifica se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: admin.email },
      });

      if (existingUser) {
        console.log(`⏭️  Admin ${admin.name} (${admin.email}) já existe, pulando...`);
        continue;
      }

      // Cria User
      const user = await prisma.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          role: "admin",
          emailVerified: true, // Admins já vem verificados
          status: "ACTIVE", // Admins já vem ativos
        },
      });

      // Cria Account com credenciais (Better Auth structure)
      await prisma.account.create({
        data: {
          id: `${user.id}-credential`,
          accountId: user.id,
          providerId: "credential", // Better Auth usa "credential" para email/password
          userId: user.id,
          password: hashedPassword,
        },
      });

      console.log(`✅ Admin ${admin.name} (${admin.email}) criado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao criar admin ${admin.name}:`, error);
    }
  }

  console.log("\n✨ Seeding de admins concluído!");
}

seedAdmins()
  .catch((error) => {
    console.error("💥 Erro fatal no seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
