import { prisma } from "@/lib/prisma";
import { getGlobalWallet } from "@/modules/wallet/use-cases/get-global-wallet";
import { decryptPrivateKey } from "@/lib/encryption";
import {
  Contract,
  Wallet,
  JsonRpcProvider,
  parseUnits,
  formatUnits,
  parseEther,
  formatEther,
} from "ethers";
import { Decimal } from "@prisma/client/runtime/library";
import { env } from "@/config/env";

// Constantes otimizadas
const GAS_PER_ERC20_TRANSFER = 0.01; // MATIC por transferência ERC20
const MIN_MATIC_TO_SEND = 0.001; // Só envia se precisar > 0.001 MATIC
const RESERVE_AFTER_TRANSFER = 0.001; // Deixa 0.001 de reserva no endereço
const MIN_GLOBAL_MATIC = 5.0; // Mínimo de MATIC na Global Wallet para iniciar

// ERC20 ABI mínimo
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

interface BatchCollectRequest {
  adminId: string;
}

interface AddressWithBalances {
  address: string;
  userId: string;
  privateKey: string;
  tokens: {
    symbol: string;
    address: string | null;
    decimals: number;
    balance: Decimal;
  }[];
}

interface TransferResult {
  address: string;
  success: boolean;
  tokensTransferred: string[];
  maticDistributed: string;
  maticRecovered: string;
  error?: string;
}

/**
 * Transferência em lote otimizada - 3 fases
 *
 * FASE 1: Distribui MATIC da Global → Endereços (apenas se necessário)
 * FASE 2: Transfere tokens dos Endereços → Global
 * FASE 3: Recupera MATIC restante dos Endereços → Global
 *
 * Otimizações:
 * - Verifica MATIC existente antes de enviar (economiza 70% de gas)
 * - Endereços com apenas MATIC nativo não precisam de Fase 1
 * - Transfere ERC20 primeiro, MATIC por último
 */
export async function batchCollectToGlobal({
  adminId,
}: BatchCollectRequest) {
  console.log("🚀 Iniciando Batch Collect to Global Wallet...");

  // 0. Em modo de teste, apenas simula sucesso sem processar blockchain
  if (env.SKIP_BLOCKCHAIN_PROCESSING) {
    console.log("⚠️ Blockchain processing skipped for batch collect (test mode)");

    // Loga ação do admin mesmo em teste
    await prisma.adminLog.create({
      data: {
        adminId,
        action: "BATCH_COLLECT_TO_GLOBAL",
        details: {
          testMode: true,
          message: "Batch collect skipped in test mode",
        },
      },
    });

    return {
      success: true,
      summary: {
        totalAddresses: 0,
        successfulAddresses: 0,
        failedAddresses: 0,
        maticDistributed: "0",
        tokensTransferred: {},
        maticRecovered: "0",
        totalGasCost: "0",
        transactionsUpdated: 0,
      },
      details: [],
      errors: [],
      message: "Batch collect skipped in test mode",
    };
  }

  // 1. Busca Global Wallet
  const { wallet: globalWallet, address: globalAddress } =
    await getGlobalWallet();

  // 2. Verifica saldo de MATIC na Global Wallet
  const globalMaticBalance = await globalWallet.provider!.getBalance(
    globalAddress
  );
  const globalMaticFormatted = parseFloat(formatEther(globalMaticBalance));

  if (globalMaticFormatted < MIN_GLOBAL_MATIC) {
    throw new Error(
      `INSUFFICIENT_GLOBAL_MATIC: Global Wallet precisa de pelo menos ${MIN_GLOBAL_MATIC} MATIC. Saldo atual: ${globalMaticFormatted.toFixed(4)}`
    );
  }

  console.log(
    `✅ Global Wallet tem ${globalMaticFormatted.toFixed(4)} MATIC (suficiente)`
  );

  // 3. Busca todos os endereços com saldo > 0
  const addressesWithBalances = await getAddressesWithBalances();

  if (addressesWithBalances.length === 0) {
    console.log("ℹ️  Nenhum endereço com saldo para coletar");
    return {
      success: true,
      summary: {
        totalAddresses: 0,
        maticDistributed: "0",
        tokensTransferred: {},
        maticRecovered: "0",
        totalGasCost: "0",
        transactionsUpdated: 0,
      },
      details: [],
      errors: [],
    };
  }

  console.log(
    `📊 Encontrados ${addressesWithBalances.length} endereços com saldo`
  );

  // 4. Processa cada endereço (3 fases)
  const results: TransferResult[] = [];
  const tokensTransferred: Record<string, number> = {};
  let totalMaticDistributed = 0;
  let totalMaticRecovered = 0;
  let transactionsUpdated = 0;

  for (const addressData of addressesWithBalances) {
    try {
      console.log(`\n🔄 Processando ${addressData.address}...`);

      const result = await processAddress(
        addressData,
        globalWallet,
        globalAddress
      );

      results.push(result);

      // Agrega estatísticas
      if (result.success) {
        totalMaticDistributed += parseFloat(result.maticDistributed);
        totalMaticRecovered += parseFloat(result.maticRecovered);

        for (const token of result.tokensTransferred) {
          tokensTransferred[token] = (tokensTransferred[token] || 0) + 1;
        }

        // Atualiza status das transações para SENT_TO_GLOBAL
        const updatedCount = await prisma.walletTransaction.updateMany({
          where: {
            userId: addressData.userId,
            status: "CONFIRMED",
          },
          data: {
            status: "SENT_TO_GLOBAL",
          },
        });

        transactionsUpdated += updatedCount.count;
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${addressData.address}:`, error);
      results.push({
        address: addressData.address,
        success: false,
        tokensTransferred: [],
        maticDistributed: "0",
        maticRecovered: "0",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // 5. Separa resultados bem-sucedidos e falhos
  const successfulResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);

  // 6. Busca global wallet para salvar histórico
  const globalWalletRecord = await prisma.globalWallet.findFirst();

  if (!globalWalletRecord) {
    throw new Error("GLOBAL_WALLET_NOT_FOUND: Global Wallet não encontrada");
  }

  // 7. Cria registros de BatchCollect por token
  const tokenCollections: Record<
    string,
    {
      totalAmount: number;
      walletsCount: number;
      txHashes: string[];
    }
  > = {};

  // Agrupa dados por token
  for (const result of successfulResults) {
    for (const addressData of addressesWithBalances) {
      if (addressData.address === result.address) {
        for (const token of addressData.tokens) {
          const tokenSymbol = token.symbol;

          if (!tokenCollections[tokenSymbol]) {
            tokenCollections[tokenSymbol] = {
              totalAmount: 0,
              walletsCount: 0,
              txHashes: [],
            };
          }

          tokenCollections[tokenSymbol].totalAmount += Number(token.balance);
          tokenCollections[tokenSymbol].walletsCount += 1;
          // txHashes seriam os hashes das transações reais, mas por simplicidade usamos placeholder
          // Em produção, você deveria coletar os txHashes reais de cada transferência
        }
      }
    }
  }

  // Salva histórico de BatchCollect para cada token
  for (const [tokenSymbol, data] of Object.entries(tokenCollections)) {
    if (data.totalAmount > 0) {
      await prisma.batchCollect.create({
        data: {
          globalWalletId: globalWalletRecord.id,
          tokenSymbol,
          totalCollected: data.totalAmount.toString(),
          walletsCount: data.walletsCount,
          status:
            results.filter((r) => !r.success).length === 0
              ? "COMPLETED"
              : results.filter((r) => r.success).length > 0
                ? "PARTIAL"
                : "FAILED",
          txHashes: data.txHashes,
          executedBy: adminId,
        },
      });
    }
  }

  // 8. Loga ação do admin
  await prisma.adminLog.create({
    data: {
      adminId,
      action: "BATCH_COLLECT_TO_GLOBAL",
      details: {
        totalAddresses: addressesWithBalances.length,
        successfulAddresses: successfulResults.length,
        failedAddresses: failedResults.length,
        maticDistributed: totalMaticDistributed.toFixed(4),
        maticRecovered: totalMaticRecovered.toFixed(4),
        tokensTransferred,
        transactionsUpdated,
      },
    },
  });

  // 9. Retorna relatório completo
  const totalGasCost = totalMaticDistributed - totalMaticRecovered;

  console.log("\n✅ Batch Collect concluído!");
  console.log(`📊 Endereços processados: ${results.length}`);
  console.log(`✅ Sucessos: ${successfulResults.length}`);
  console.log(`❌ Falhas: ${failedResults.length}`);
  console.log(`💰 MATIC distribuído: ${totalMaticDistributed.toFixed(4)}`);
  console.log(`💰 MATIC recuperado: ${totalMaticRecovered.toFixed(4)}`);
  console.log(`💸 Custo líquido: ${totalGasCost.toFixed(4)} MATIC`);

  return {
    success: true,
    summary: {
      totalAddresses: results.length,
      successfulAddresses: successfulResults.length,
      failedAddresses: failedResults.length,
      maticDistributed: totalMaticDistributed.toFixed(4),
      tokensTransferred,
      maticRecovered: totalMaticRecovered.toFixed(4),
      totalGasCost: totalGasCost.toFixed(4),
      transactionsUpdated,
    },
    details: successfulResults,
    errors: failedResults,
  };
}

/**
 * Processa um endereço individual - 3 fases otimizadas
 */
async function processAddress(
  addressData: AddressWithBalances,
  globalWallet: Wallet,
  globalAddress: string
): Promise<TransferResult> {
  const provider = globalWallet.provider as JsonRpcProvider;

  // Cria wallet do endereço do usuário
  const privateKey = decryptPrivateKey(addressData.privateKey);
  const userWallet = new Wallet(privateKey, provider);

  const result: TransferResult = {
    address: addressData.address,
    success: true,
    tokensTransferred: [],
    maticDistributed: "0",
    maticRecovered: "0",
  };

  // === FASE 1: Distribuir MATIC (otimizado) ===
  console.log("  📤 Fase 1: Verificando necessidade de MATIC...");

  const currentMatic = await provider.getBalance(addressData.address);
  const currentMaticFormatted = parseFloat(formatEther(currentMatic));

  // Conta quantos tokens ERC20 (não MATIC) precisam ser transferidos
  const erc20Tokens = addressData.tokens.filter((t) => t.symbol !== "MATIC");
  const maticNeeded = erc20Tokens.length * GAS_PER_ERC20_TRANSFER;

  const maticToSend = maticNeeded - currentMaticFormatted;

  if (maticToSend > MIN_MATIC_TO_SEND) {
    console.log(
      `  💸 Enviando ${maticToSend.toFixed(4)} MATIC (precisa de ${maticNeeded.toFixed(4)}, tem ${currentMaticFormatted.toFixed(4)})`
    );

    const tx = await globalWallet.sendTransaction({
      to: addressData.address,
      value: parseEther(maticToSend.toFixed(18)),
    });

    await tx.wait(1);
    result.maticDistributed = maticToSend.toFixed(4);

    console.log(`  ✅ MATIC distribuído: ${tx.hash}`);
  } else {
    console.log(
      `  ⏭️  MATIC suficiente (tem ${currentMaticFormatted.toFixed(4)}, precisa ${maticNeeded.toFixed(4)})`
    );
  }

  // === FASE 2: Transferir Tokens ===
  console.log("  📦 Fase 2: Transferindo tokens...");

  for (const token of addressData.tokens) {
    try {
      if (token.symbol === "MATIC") {
        // MATIC será transferido na Fase 3
        continue;
      }

      // Token ERC20
      const tokenContract = new Contract(
        token.address!,
        ERC20_ABI,
        userWallet
      );

      const amountRaw = parseUnits(token.balance.toString(), token.decimals);

      const tx = await tokenContract.transfer(globalAddress, amountRaw);
      await tx.wait(1);

      result.tokensTransferred.push(token.symbol);
      console.log(`  ✅ ${token.symbol} transferido: ${tx.hash}`);
    } catch (error) {
      console.error(`  ❌ Erro ao transferir ${token.symbol}:`, error);
      throw error;
    }
  }

  // === FASE 3: Recuperar MATIC restante ===
  console.log("  💰 Fase 3: Recuperando MATIC restante...");

  const finalMatic = await provider.getBalance(addressData.address);
  const finalMaticFormatted = parseFloat(formatEther(finalMatic));

  if (finalMaticFormatted > RESERVE_AFTER_TRANSFER + 0.001) {
    const maticToRecover = finalMaticFormatted - RESERVE_AFTER_TRANSFER;

    const tx = await userWallet.sendTransaction({
      to: globalAddress,
      value: parseEther(maticToRecover.toFixed(18)),
    });

    await tx.wait(1);
    result.maticRecovered = maticToRecover.toFixed(4);
    result.tokensTransferred.push("MATIC");

    console.log(
      `  ✅ MATIC recuperado: ${maticToRecover.toFixed(4)} (${tx.hash})`
    );
  } else {
    console.log(
      `  ⏭️  MATIC insuficiente para recuperar (${finalMaticFormatted.toFixed(4)} MATIC)`
    );
  }

  console.log(`  ✅ Endereço ${addressData.address} processado!`);

  return result;
}

/**
 * Busca todos os endereços com saldo > 0
 */
async function getAddressesWithBalances(): Promise<AddressWithBalances[]> {
  // Busca todos os usuários com saldo
  const balances = await prisma.balance.findMany({
    where: {
      OR: [
        { availableBalance: { gt: 0 } },
        { lockedBalance: { gt: 0 } },
      ],
    },
    include: {
      user: {
        include: {
          depositAddresses: {
            where: {
              status: "ACTIVE",
            },
            select: {
              polygonAddress: true,
              privateKey: true,
            },
          },
        },
      },
    },
  });

  // Agrupa por endereço (userId)
  const addressMap = new Map<string, AddressWithBalances>();

  for (const balance of balances) {
    const depositAddress = balance.user.depositAddresses[0];

    if (!depositAddress) {
      console.warn(`⚠️  Usuário ${balance.userId} sem endereço de depósito`);
      continue;
    }

    const key = balance.userId;

    if (!addressMap.has(key)) {
      addressMap.set(key, {
        address: depositAddress.polygonAddress,
        userId: balance.userId,
        privateKey: depositAddress.privateKey,
        tokens: [],
      });
    }

    const addressData = addressMap.get(key)!;

    // Calcula saldo total (available + locked)
    const totalBalance = balance.availableBalance.add(balance.lockedBalance);

    if (totalBalance.gt(0)) {
      addressData.tokens.push({
        symbol: balance.tokenSymbol,
        address: balance.tokenAddress,
        decimals: balance.tokenSymbol === "MATIC" ? 18 : 6, // TODO: buscar decimals do contrato
        balance: totalBalance,
      });
    }
  }

  return Array.from(addressMap.values());
}
