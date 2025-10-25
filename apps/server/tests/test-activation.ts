/**
 * Teste da Lógica de Ativação de Conta
 *
 * Testa se a conta é ativada automaticamente após depósito >= $100 USD
 *
 * Como usar:
 * npx tsx tests/test-activation.ts
 */

import { getTokenPriceUSD, convertToUSD } from "../src/services/price.service";

async function testPriceService() {
  console.log("🧪 Testando serviço de preços\n");

  // Teste 1: Stablecoins sempre $1
  console.log("📝 Teste 1: Stablecoins");
  const usdcPrice = await getTokenPriceUSD("USDC");
  const usdtPrice = await getTokenPriceUSD("USDT");
  const daiPrice = await getTokenPriceUSD("DAI");

  console.log(`   USDC: $${usdcPrice} (esperado: $1.00)`);
  console.log(`   USDT: $${usdtPrice} (esperado: $1.00)`);
  console.log(`   DAI: $${daiPrice} (esperado: $1.00)`);

  if (usdcPrice === 1 && usdtPrice === 1 && daiPrice === 1) {
    console.log("   ✅ Stablecoins corretos\n");
  } else {
    console.log("   ❌ Erro nos preços de stablecoins\n");
  }

  // Teste 2: MATIC busca preço real
  console.log("📝 Teste 2: MATIC (preço real)");
  const maticPrice = await getTokenPriceUSD("MATIC");
  console.log(`   MATIC: $${maticPrice.toFixed(4)}`);

  if (maticPrice > 0) {
    console.log("   ✅ Preço MATIC obtido\n");
  } else {
    console.log("   ❌ Erro ao buscar preço MATIC\n");
  }

  // Teste 3: Conversão de valores
  console.log("📝 Teste 3: Conversão para USD");
  const usd100 = await convertToUSD("USDC", 100);
  console.log(`   100 USDC = $${usd100.toFixed(2)} (esperado: $100.00)`);

  const matic10 = await convertToUSD("MATIC", 10);
  console.log(`   10 MATIC = $${matic10.toFixed(2)}`);

  if (usd100 === 100) {
    console.log("   ✅ Conversão USDC correta\n");
  } else {
    console.log("   ❌ Erro na conversão USDC\n");
  }

  // Teste 4: Cenários de ativação
  console.log("📝 Teste 4: Cenários de Ativação de Conta\n");

  const scenarios = [
    { description: "50 USDC", usdc: 50, shouldActivate: false },
    { description: "100 USDC", usdc: 100, shouldActivate: true },
    { description: "150 USDC", usdc: 150, shouldActivate: true },
    { description: "50 USDC + 50 USDT", usdc: 50, usdt: 50, shouldActivate: true },
    { description: "90 USDC + 5 MATIC", usdc: 90, matic: 5, shouldActivate: "depends" },
  ];

  for (const scenario of scenarios) {
    let total = 0;

    if (scenario.usdc) {
      total += await convertToUSD("USDC", scenario.usdc);
    }

    if (scenario.usdt) {
      total += await convertToUSD("USDT", scenario.usdt);
    }

    if (scenario.matic) {
      total += await convertToUSD("MATIC", scenario.matic);
    }

    const willActivate = total >= 100;
    const status = willActivate ? "✅ ATIVA" : "❌ NÃO ATIVA";

    console.log(`   ${scenario.description}:`);
    console.log(`      Total: $${total.toFixed(2)} USD`);
    console.log(`      Status: ${status}`);

    if (scenario.shouldActivate === true && !willActivate) {
      console.log(`      ⚠️  ERRO: Deveria ativar mas não ativou!`);
    } else if (scenario.shouldActivate === false && willActivate) {
      console.log(`      ⚠️  ERRO: Não deveria ativar mas ativou!`);
    } else if (scenario.shouldActivate === "depends") {
      console.log(`      ℹ️  Depende do preço atual do MATIC`);
    } else {
      console.log(`      ✅ Comportamento correto`);
    }

    console.log();
  }

  console.log("=" .repeat(60));
  console.log("✅ Testes de ativação de conta concluídos!");
  console.log("=" .repeat(60));
}

testPriceService();
