import { PrismaClient } from "@prisma/client";
import { Contract, parseUnits, JsonRpcProvider, Wallet } from "ethers";

// Para usar em produção, rode com:
// DATABASE_URL="postgresql://..." npx tsx test-deposit-from-global.ts

const prisma = new PrismaClient();

// Função para descriptografar (copiada do projeto)
function decryptPrivateKey(encryptedData: string): string {
  const crypto = require("crypto");
  const [ivHex, authTagHex, ciphertextHex] = encryptedData.split(":");
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// ERC20 ABI mínimo
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// USDC na Polygon Mainnet
const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

async function main() {
  const destinationAddress = "0xbe9b58870c378652f425716d53cb3f4413899a44";
  const amountUSDC = "0.0001"; // 0.0001 USDC = $0.0001

  console.log("🔍 Buscando Global Wallet...");

  // 1. Busca Global Wallet
  const globalWallet = await prisma.globalWallet.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!globalWallet) {
    console.error("❌ Global Wallet não encontrada!");
    return;
  }

  console.log(`✅ Global Wallet: ${globalWallet.polygonAddress}`);

  // 2. Verifica se o endereço de destino existe no sistema
  const depositAddress = await prisma.depositAddress.findUnique({
    where: { polygonAddress: destinationAddress.toLowerCase() },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!depositAddress) {
    console.error("❌ Endereço de depósito não encontrado no sistema!");
    return;
  }

  console.log(`✅ Destino encontrado: ${depositAddress.user.email}`);

  // 3. Conecta na Polygon
  const provider = new JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const privateKey = decryptPrivateKey(globalWallet.privateKey);
  const wallet = new Wallet(privateKey, provider);

  // 4. Verifica saldo de USDC
  const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, wallet);
  const decimals = await usdcContract.decimals();
  const balance = await usdcContract.balanceOf(globalWallet.polygonAddress);
  const balanceFormatted = Number(balance) / 10 ** Number(decimals);

  console.log(`💰 Saldo USDC na Global Wallet: ${balanceFormatted} USDC`);

  const amountRaw = parseUnits(amountUSDC, decimals);

  if (balance < amountRaw) {
    console.error(`❌ Saldo insuficiente! Precisa de ${amountUSDC} USDC`);
    return;
  }

  // 5. Verifica saldo de MATIC para gas
  const maticBalance = await provider.getBalance(globalWallet.polygonAddress);
  const maticFormatted = Number(maticBalance) / 10 ** 18;

  console.log(`⛽ Saldo MATIC (gas): ${maticFormatted.toFixed(6)} MATIC`);

  if (maticFormatted < 0.001) {
    console.error("❌ Saldo de MATIC insuficiente para gas!");
    return;
  }

  // 6. Confirma antes de enviar
  console.log("\n📤 Preparando transferência:");
  console.log(`   De: ${globalWallet.polygonAddress}`);
  console.log(`   Para: ${destinationAddress}`);
  console.log(`   Valor: ${amountUSDC} USDC`);
  console.log("\n⏳ Enviando transação...");

  // 7. Envia a transação
  try {
    const tx = await usdcContract.transfer(destinationAddress, amountRaw);
    console.log(`📤 TX enviada: ${tx.hash}`);
    console.log(`🔗 https://polygonscan.com/tx/${tx.hash}`);

    console.log("\n⏳ Aguardando confirmação...");
    const receipt = await tx.wait(1);

    console.log(`\n✅ Transação CONFIRMADA!`);
    console.log(`   Block: ${receipt?.blockNumber}`);
    console.log(`   Gas usado: ${receipt?.gasUsed.toString()}`);
    console.log(
      `\n🎉 ${amountUSDC} USDC enviado para ${destinationAddress}`
    );
    console.log(
      `\n⏳ O webhook do Moralis deve processar isso em alguns segundos...`
    );
  } catch (error) {
    console.error("❌ Erro ao enviar:", error);
  }

  await prisma.$disconnect();
}

main();
