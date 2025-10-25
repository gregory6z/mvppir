/**
 * Show Sponsor MLM Profile
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  const { getUserMLMProfile } = await import("../src/modules/mlm/use-cases/get-user-mlm-profile");

  const sponsor = await prisma.user.findUnique({
    where: { email: "sponsor@test.com" },
  });

  if (!sponsor) {
    throw new Error("Sponsor not found");
  }

  const profile = await getUserMLMProfile(sponsor.id);

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  USER: ${profile.user.name} (${profile.user.email})`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`  Current Rank: ${profile.user.currentRank} 🎖️`);
  console.log(`  Rank Status: ${profile.user.rankStatus}`);
  console.log(`  Rank Conquered At: ${profile.user.rankConqueredAt}`);
  console.log(`  Blocked Balance: $${profile.user.blockedBalance}`);
  console.log(`  Loyalty Tier: ${profile.user.loyaltyTier}`);
  console.log(`\n  Network:`);
  console.log(`    Total Directs: ${profile.network.totalDirects}`);
  console.log(`    Active Directs: ${profile.network.activeDirects}`);
  console.log(`    Lifetime Volume: $${profile.network.lifetimeVolume}`);
  console.log(`\n  Network Levels:`);
  console.log(`    N1: ${profile.network.levels.N1.count} users, $${profile.network.levels.N1.totalBalance}`);
  console.log(`    N2: ${profile.network.levels.N2.count} users, $${profile.network.levels.N2.totalBalance}`);
  console.log(`    N3: ${profile.network.levels.N3.count} users, $${profile.network.levels.N3.totalBalance}`);
  console.log(`\n  Commission Rates (BRONZE):`);
  console.log(`    N1: ${profile.commissionRates.N1}%`);
  console.log(`    N2: ${profile.commissionRates.N2}%`);
  console.log(`    N3: ${profile.commissionRates.N3}%`);

  if (profile.nextRankPreview) {
    console.log(`\n  Next Rank: ${profile.nextRankPreview.rank}`);
    console.log(`  Can Progress: ${profile.nextRankPreview.canProgress ? "Yes ✅" : "No ❌"}`);

    if (profile.nextRankPreview.missingRequirements.length > 0) {
      console.log(`  Missing:`);
      profile.nextRankPreview.missingRequirements.forEach((req) =>
        console.log(`    - ${req}`)
      );
    }
  }

  console.log(`═══════════════════════════════════════════════════\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
