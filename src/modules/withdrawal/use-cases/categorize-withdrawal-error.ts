export enum FailureType {
  RECOVERABLE = "RECOVERABLE", // Pode tentar novamente depois (sem gas, sem saldo)
  PERMANENT = "PERMANENT", // Não adianta tentar (endereço inválido, token pausado)
}

/**
 * Categoriza erro de processamento de saque
 *
 * RECOVERABLE: Erros temporários que podem ser resolvidos
 * - Insufficient funds/balance na Global Wallet
 * - Insufficient MATIC for gas
 * - Network errors / timeouts
 * - Nonce issues
 *
 * PERMANENT: Erros que não se resolvem sozinhos
 * - Invalid destination address
 * - Token contract paused
 * - Token not found
 * - Other blockchain rejections
 */
export function categorizeWithdrawalError(error: Error): FailureType {
  const message = error.message.toLowerCase();

  // Erros recuperáveis (infra/temporários)
  const recoverablePatterns = [
    "insufficient funds",
    "insufficient balance",
    "insufficient matic",
    "insufficient eth", // Alguns RPCs retornam "ETH" mesmo em Polygon
    "gas required exceeds",
    "nonce too low",
    "nonce too high",
    "replacement transaction underpriced",
    "timeout",
    "network",
    "connection",
    "econnrefused",
    "etimedout",
    "socket hang up",
  ];

  for (const pattern of recoverablePatterns) {
    if (message.includes(pattern)) {
      return FailureType.RECOVERABLE;
    }
  }

  // Todos os outros são permanentes
  return FailureType.PERMANENT;
}
