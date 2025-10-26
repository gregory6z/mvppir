import { prisma } from "./src/lib/prisma.js";
import { Decimal } from "@prisma/client/runtime/library";

// Lista de tokens populares na Polygon
const tokens = [
  { symbol: "USDC", address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", decimals: 6 },
  { symbol: "USDT", address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", decimals: 6 },
  { symbol: "MATIC", address: null, decimals: 18 }, // Native token
  { symbol: "WETH", address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", decimals: 18 },
  { symbol: "DAI", address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", decimals: 18 },
  { symbol: "WBTC", address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", decimals: 8 },
  { symbol: "LINK", address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39", decimals: 18 },
  { symbol: "UNI", address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f", decimals: 18 },
  { symbol: "AAVE", address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b", decimals: 18 },
  { symbol: "CRV", address: "0x172370d5cd63279efa6d502dab29171933a610af", decimals: 18 },
  { symbol: "SUSHI", address: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a", decimals: 18 },
  { symbol: "BAL", address: "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3", decimals: 18 },
  { symbol: "SNX", address: "0x50b728d8d964fd00c2d0aad81718b71311fef68a", decimals: 18 },
  { symbol: "MKR", address: "0x6f7c932e7684666c9fd1d44527765433e01ff61d", decimals: 18 },
  { symbol: "YFI", address: "0xda537104d6a5edd53c6fbba9a898708e465260b6", decimals: 18 },
  { symbol: "1INCH", address: "0x9c2c5fd7b07e95ee044ddeba0e97a665f142394f", decimals: 18 },
  { symbol: "COMP", address: "0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c", decimals: 18 },
  { symbol: "GRT", address: "0x5fe2b58c013d7601147dcdd68c143a77499f5531", decimals: 18 },
  { symbol: "FTM", address: "0xc9c1c1c20b3658f8787cc2fd702267791f224ce1", decimals: 18 },
  { symbol: "SAND", address: "0xbbba073c31bf03b8acf7c28ef0738decf3695683", decimals: 18 },
  { symbol: "MANA", address: "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4", decimals: 18 },
  { symbol: "ENJ", address: "0x7ec26842f195c852fa843bb9f6d8b583a274a157", decimals: 18 },
  { symbol: "CHZ", address: "0xf1938ce12400f9a761084e7a80d37e732a4da056", decimals: 18 },
  { symbol: "AXS", address: "0x61bdd9c7d4df4bf47a4508c0c8245505f2af5b7b", decimals: 18 },
  { symbol: "GALA", address: "0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827", decimals: 8 },
  { symbol: "APE", address: "0xb7b31a6bc18e48888545ce79e83e06003be70930", decimals: 18 },
  { symbol: "LDO", address: "0xc3c7d422809852031b44ab29eec9f1eff2a58756", decimals: 18 },
  { symbol: "SHIB", address: "0x6f8a06447ff6fcf75d803135a7de15ce88c1d4ec", decimals: 18 },
  { symbol: "AVAX", address: "0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b", decimals: 18 },
  { symbol: "FTT", address: "0x50b728d8d964fd00c2d0aad81718b71311fef68a", decimals: 18 },
  { symbol: "ATOM", address: "0xac51c4c48dc3116487ed4bc16542e27b5694da1b", decimals: 6 },
  { symbol: "NEAR", address: "0x72928d5436ff65e57f72d5566dcd3baedc649a88", decimals: 24 },
  { symbol: "ALGO", address: "0x6b175474e89094c44da98b954eedeac495271d0f", decimals: 6 },
  { symbol: "ICP", address: "0xaa0c5b3866fbfbadb3c62793091f126c1c4e6e88", decimals: 18 },
  { symbol: "QNT", address: "0x3b9424f4c4b7f9eb38d9d69e5f7e56d4f3e5af4f", decimals: 18 },
  { symbol: "XTZ", address: "0x23ffdf5de738a5d7db586641e2d2eab8e9de49da", decimals: 6 },
  { symbol: "EOS", address: "0xd5d5350f42cb484036a1c1af5f2df77eafadcaff", decimals: 18 },
  { symbol: "THETA", address: "0xb46e0ae620efd98516f49bb00263317096c114b2", decimals: 18 },
  { symbol: "XLM", address: "0xbfc6e4e3f8d970fd6c6a5f1e99d1dcf42e7e24f3", decimals: 7 },
  { symbol: "VET", address: "0x6d26fe8e9779e8b3e6f75d6c5256b18e12ade65d", decimals: 18 },
  { symbol: "HBAR", address: "0xfd0d2c3c79e7fa75bbe1a24d2e1a4e2f44d3f5a1", decimals: 8 },
  { symbol: "FIL", address: "0xede1b77c0ccc45bfa949636757cd2ca7ef30137f", decimals: 18 },
  { symbol: "TRX", address: "0xf2f3715f8c8c5fc64cbd3e21f7f5e7f69fdf6f1e", decimals: 6 },
  { symbol: "ETC", address: "0xd49ff13661451313ca1553fd6954bd1d9b6e02b9", decimals: 18 },
  { symbol: "XMR", address: null, decimals: 12 },
  { symbol: "BSV", address: null, decimals: 8 },
  { symbol: "CAKE", address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", decimals: 18 },
];

function randomBalance(min: number, max: number): string {
  const random = Math.random() * (max - min) + min;
  return random.toFixed(6);
}

async function seedGlobalWallet() {
  try {
    console.log("🌱 Seeding Global Wallet com tokens mockados...\n");

    // Buscar Global Wallet
    const globalWallet = await prisma.globalWallet.findFirst();

    if (!globalWallet) {
      console.error("❌ Global Wallet não encontrada. Execute create-global-wallet.ts primeiro.");
      return;
    }

    console.log(`✅ Global Wallet encontrada: ${globalWallet.polygonAddress}\n`);

    // Limpar saldos existentes
    await prisma.globalWalletBalance.deleteMany({
      where: { globalWalletId: globalWallet.id },
    });

    console.log("🗑️  Saldos anteriores removidos\n");

    // Selecionar entre 20-50 tokens aleatoriamente
    const numTokens = Math.floor(Math.random() * 31) + 20; // 20 a 50
    const selectedTokens = [...tokens]
      .sort(() => Math.random() - 0.5)
      .slice(0, numTokens);

    console.log(`📊 Criando saldos para ${numTokens} tokens...\n`);

    // Criar saldos para cada token
    for (const token of selectedTokens) {
      let balance: string;

      // Saldos diferentes baseados no tipo de token
      if (["USDC", "USDT", "DAI"].includes(token.symbol)) {
        // Stablecoins: entre 1,000 e 500,000
        balance = randomBalance(1000, 500000);
      } else if (["WBTC", "YFI", "MKR"].includes(token.symbol)) {
        // Tokens caros: entre 0.1 e 10
        balance = randomBalance(0.1, 10);
      } else if (["MATIC", "ETH", "WETH", "AVAX"].includes(token.symbol)) {
        // Tokens de médio valor: entre 100 e 10,000
        balance = randomBalance(100, 10000);
      } else if (["SHIB", "GALA"].includes(token.symbol)) {
        // Tokens baratos: entre 1M e 100M
        balance = randomBalance(1000000, 100000000);
      } else {
        // Outros tokens: entre 10 e 50,000
        balance = randomBalance(10, 50000);
      }

      await prisma.globalWalletBalance.create({
        data: {
          globalWalletId: globalWallet.id,
          tokenSymbol: token.symbol,
          tokenAddress: token.address?.toLowerCase() || null,
          balance: new Decimal(balance),
        },
      });

      console.log(
        `  ✓ ${token.symbol.padEnd(8)} - ${Number(balance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}`
      );
    }

    console.log(`\n✅ ${numTokens} tokens adicionados com sucesso!`);
    console.log("\n🎉 Global Wallet populada e pronta para visualização!\n");
  } catch (error) {
    console.error("❌ Erro ao popular Global Wallet:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGlobalWallet();
