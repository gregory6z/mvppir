import { prisma } from "../src/lib/prisma";

function generateReferralCode(name: string): string {
  // Remove espaços e acentos, deixa apenas letras (2 caracteres)
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 2);

  // Gera 4 caracteres alfanuméricos aleatórios
  const alphanumeric = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomSuffix = "";
  for (let i = 0; i < 4; i++) {
    randomSuffix += alphanumeric.charAt(
      Math.floor(Math.random() * alphanumeric.length)
    );
  }

  return `${cleanName}${randomSuffix}`; // Total: 6 chars
}

async function generateReferralCodes() {
  console.log("🔧 Generating referral codes for users without codes...\n");

  const usersWithoutCode = await prisma.user.findMany({
    where: {
      referralCode: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (usersWithoutCode.length === 0) {
    console.log("✅ All users already have referral codes!");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${usersWithoutCode.length} users without referral codes\n`);

  for (const user of usersWithoutCode) {
    let referralCode = generateReferralCode(user.name);
    let attempts = 0;
    const maxAttempts = 10;

    // Garante que o código seja único
    while (attempts < maxAttempts) {
      const existing = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!existing) {
        break;
      }

      // Se código existe, tenta novamente com outro número
      referralCode = generateReferralCode(user.name);
      attempts++;
    }

    if (attempts === maxAttempts) {
      console.log(`❌ Failed to generate unique code for ${user.name}`);
      continue;
    }

    // Atualiza o usuário com o código
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode },
    });

    console.log(`✅ ${user.name} (${user.email})`);
    console.log(`   Code: ${referralCode}\n`);
  }

  console.log("\n🎉 Done! All users now have referral codes.");
  await prisma.$disconnect();
}

generateReferralCodes().catch(console.error);
