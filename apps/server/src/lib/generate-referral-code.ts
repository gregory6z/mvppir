import { prisma } from "./prisma";

/**
 * Generates a unique referral code based on user's name
 * Format: [NAME_UP_TO_6_CHARS][3_RANDOM_ALPHANUMERIC]
 * Example: "GREGORYAB7", "JOHNX9K"
 */
export async function generateUniqueReferralCode(name: string): Promise<string> {
  // Clean name: remove accents, spaces, special chars, keep only letters
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z]/g, "") // Keep only letters
    .toUpperCase()
    .slice(0, 6); // Max 6 chars from name

  const maxAttempts = 20;
  let attempts = 0;

  // Alphanumeric characters (letters + numbers, excluding confusing chars like O, 0, I, l)
  const alphanumeric = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  while (attempts < maxAttempts) {
    // Generate 3 random alphanumeric characters
    let randomSuffix = "";
    for (let i = 0; i < 3; i++) {
      randomSuffix += alphanumeric.charAt(
        Math.floor(Math.random() * alphanumeric.length)
      );
    }

    const referralCode = `${cleanName}${randomSuffix}`;

    // Check if code is unique
    const existing = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!existing) {
      return referralCode;
    }

    attempts++;
  }

  // Fallback: if couldn't generate unique code after 20 attempts
  // Use timestamp-based code
  const timestamp = Date.now().toString().slice(-6);
  return `${cleanName}${timestamp}`.slice(0, 11);
}
