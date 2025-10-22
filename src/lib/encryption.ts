import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Criptografa uma private key usando AES-256-GCM
 * @param privateKey - Private key em texto plano
 * @returns String no formato: iv:authTag:encrypted
 */
export function encryptPrivateKey(privateKey: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Descriptografa uma private key usando AES-256-GCM
 * @param encryptedData - String no formato: iv:authTag:encrypted
 * @returns Private key em texto plano
 */
export function decryptPrivateKey(encryptedData: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
