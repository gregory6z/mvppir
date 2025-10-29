import { prisma } from "./prisma";

/**
 * Generates a unique referral code based on user's name
 * Format: [2_LETTERS_FROM_NAME][4_RANDOM_ALPHANUMERIC] = 6 chars total
 * Example: "JO7A3K", "GR9X2P", "MA4B5C"
 */
export async function generateUniqueReferralCode(name: string): Promise<string> {
  // Clean name: remove accents, spaces, special chars, keep only letters
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z]/g, "") // Keep only letters
    .toUpperCase()
    .slice(0, 2); // Only 2 chars from name

  const maxAttempts = 20;
  let attempts = 0;

  // Alphanumeric characters (letters + numbers, excluding confusing chars like O, 0, I, l, 1)
  const alphanumeric = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  while (attempts < maxAttempts) {
    // Generate 4 random alphanumeric characters
    let randomSuffix = "";
    for (let i = 0; i < 4; i++) {
      randomSuffix += alphanumeric.charAt(
        Math.floor(Math.random() * alphanumeric.length)
      );
    }

    const referralCode = `${cleanName}${randomSuffix}`; // Total: 2 + 4 = 6 chars

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
  // Use 6-digit timestamp-based code
  const timestamp = Date.now().toString().slice(-4);
  return `${cleanName}${timestamp}`.slice(0, 6);
}
