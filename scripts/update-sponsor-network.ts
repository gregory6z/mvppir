/**
 * Update Sponsor Network Stats
 *
 * Updates sponsor's total lifetime volume including all referrals
 * and checks for rank progression.
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  // Get sponsor
  const sponsor = await prisma.user.findUnique({
    where: { email: "sponsor@test.com" },
    include: {
      referrals: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!sponsor) {
    throw new Error("Sponsor not found");
  }

  // Calculate total network lifetime volume
  const directsVolume = sponsor.referrals.reduce(
    (sum, ref) => sum + parseFloat(ref.lifetimeVolume.toString()),
    0
  );

  const totalNetworkVolume = parseFloat(sponsor.lifetimeVolume.toString()) + directsVolume;

  console.log(`📊 Network Stats:`);
  console.log(`  Sponsor volume: $${sponsor.lifetimeVolume}`);
  console.log(`  Directs volume: $${directsVolume}`);
  console.log(`  Total network: $${totalNetworkVolume}`);

  // Update sponsor's lifetime volume to reflect network
  await prisma.user.update({
    where: { id: sponsor.id },
    data: {
      lifetimeVolume: totalNetworkVolume,
    },
  });

  console.log(`✅ Sponsor lifetime volume updated to $${totalNetworkVolume}`);

  // Check rank progression
  const { autoCheckAndPromote } = await import("../src/modules/mlm/use-cases/check-rank-progression");
  const promoted = await autoCheckAndPromote(sponsor.id);

  if (promoted) {
    const updated = await prisma.user.findUnique({
      where: { id: sponsor.id },
      select: { currentRank: true, rankConqueredAt: true },
    });
    console.log(`🎉 PROMOTED to ${updated?.currentRank}!`);
    console.log(`   Conquered at: ${updated?.rankConqueredAt}`);
  } else {
    console.log(`⏳ Not promoted yet`);

    const { getMissingRequirements } = await import("../src/modules/mlm/use-cases/calculate-rank-requirements");
    const missing = await getMissingRequirements(sponsor.id, "BRONZE");
    console.log(`Missing requirements:`);
    missing.forEach(req => console.log(`  - ${req}`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
