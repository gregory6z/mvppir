/**
 * Script para processar um saque manualmente
 *
 * Uso: npx tsx scripts/process-withdrawal.ts <withdrawal-id>
 */

import { processWithdrawal } from "../src/modules/withdrawal/use-cases/process-withdrawal";

const withdrawalId = process.argv[2];

if (!withdrawalId) {
  console.error("❌ Uso: npx tsx scripts/process-withdrawal.ts <withdrawal-id>");
  process.exit(1);
}

console.log(`🔄 Processando saque ${withdrawalId}...`);

processWithdrawal({ withdrawalId })
  .then((result) => {
    console.log("✅ Saque processado com sucesso!");
    console.log("📄 TxHash:", result.txHash);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro ao processar saque:", error.message);
    process.exit(1);
  });
