import { keccak256 } from "ethers";

/**
 * Valida a assinatura de um webhook do Moralis
 * Moralis usa: web3.utils.sha3(JSON.stringify(body) + secret)
 * sha3 do web3 = Keccak256
 *
 * @param payload - Corpo do webhook (objeto)
 * @param signature - Assinatura recebida no header x-signature
 * @returns true se a assinatura é válida
 */
export function validateMoralisSignature(
  payload: any,
  signature: string
): boolean {
  const streamSecret = process.env.MORALIS_STREAM_SECRET;

  if (!streamSecret) {
    throw new Error("MORALIS_STREAM_SECRET not configured");
  }

  // Concatena body + secret e calcula keccak256
  const data = JSON.stringify(payload) + streamSecret;
  const hash = keccak256(Buffer.from(data));

  return hash === signature;
}
