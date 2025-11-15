import { keccak256 } from "ethers";

/**
 * Valida a assinatura de um webhook do Moralis
 * Moralis usa: web3.utils.sha3(RAW_BODY + secret)
 * sha3 do web3 = Keccak256
 *
 * @param rawBody - Corpo RAW do webhook (string original)
 * @param signature - Assinatura recebida no header x-signature
 * @returns true se a assinatura é válida
 */
export function validateMoralisSignature(
  rawBody: string,
  signature: string
): boolean {
  const streamSecret = process.env.MORALIS_STREAM_SECRET;

  if (!streamSecret) {
    throw new Error("MORALIS_STREAM_SECRET not configured");
  }

  // Concatena raw body + secret e calcula keccak256
  const data = rawBody + streamSecret;
  const hash = keccak256(Buffer.from(data));

  return hash === signature;
}
