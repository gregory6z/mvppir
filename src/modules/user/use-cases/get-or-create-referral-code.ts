/**
 * Get or Create Referral Code
 *
 * Returns the user's referral code, creating one if it doesn't exist.
 * Format: FIRSTNAME{RANDOMNUMBER} (ex: GREGORY123)
 */

import { prisma } from "@/lib/prisma";

/**
 * Generate a unique referral code
 * Format: GREG7X9 (4 letters + 3 random alphanumeric)
 */
async function generateReferralCode(name: string): Promise<string> {
  // Extract first name and convert to uppercase
  const firstName = name.trim().split(" ")[0].toUpperCase();

  // Remove special characters and accents, get first 4 letters
  const cleanFirstName = firstName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^A-Z]/g, "") // Keep only letters
    .slice(0, 4); // Max 4 characters

  // Generate 3 random alphanumeric characters
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 3; i++) {
    randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Format: GREG7X9 (7 chars total)
  const code = `${cleanFirstName}${randomPart}`;

  // Check if code already exists
  const existing = await prisma.user.findUnique({
    where: { referralCode: code },
  });

  // If exists, try again recursively
  if (existing) {
    return generateReferralCode(name);
  }

  return code;
}

/**
 * Get or create referral code for user
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      referralCode: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If user already has a referral code, return it
  if (user.referralCode) {
    return user.referralCode;
  }

  // Generate new unique code
  const newCode = await generateReferralCode(user.name);

  // Update user with new code
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: newCode },
  });

  return newCode;
}

/**
 * Get referral link for user
 */
export async function getReferralLink(userId: string): Promise<string> {
  const code = await getOrCreateReferralCode(userId);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  return `${frontendUrl}/signup?ref=${code}`;
}
