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
const GAS_LIMIT_ERC20_TRANSFER = 65000n; // Gas limit típico para transfer ERC20
const GAS_LIMIT_NATIVE_TRANSFER = 21000n; // Gas limit para transferência nativa
const MIN_MATIC_TO_SEND = 0.001; // Só envia se precisar > 0.001 MATIC
const RESERVE_AFTER_TRANSFER = 0.001; // Deixa 0.001 de reserva no endereço
const MIN_GLOBAL_MATIC = 5.0; // Mínimo de MATIC na Global Wallet para iniciar
const GAS_PRICE_MULTIPLIER = 1.3; // 30% buffer para variação de gas price

/**
 * Calcula o custo estimado de gas para transferências ERC20
 * Usa o gas price atual da rede + buffer de segurança
 */
async function estimateGasCostForTransfers(
  provider: JsonRpcProvider,
  numErc20Transfers: number
): Promise<number> {
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || 50000000000n; // 50 gwei fallback

  // Custo por transferência ERC20: gasPrice * gasLimit * multiplier
  const costPerTransfer = gasPrice * GAS_LIMIT_ERC20_TRANSFER;
  const totalCost = costPerTransfer * BigInt(numErc20Transfers);

  // Adiciona buffer de segurança
  const totalWithBuffer = (totalCost * BigInt(Math.floor(GAS_PRICE_MULTIPLIER * 100))) / 100n;

  return parseFloat(formatEther(totalWithBuffer));
}

// ERC20 ABI mínimo
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

interface BatchCollectRequest {
  adminId: string;
  onProgress?: (current: number, total: number, failed: number) => Promise<void>;
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
  txHashes: string[]; // Hashes das transações confirmadas on-chain
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
  onProgress,
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
  let processedCount = 0;
  let failedCount = 0;
  const totalCount = addressesWithBalances.length;

  // Reporta progresso inicial
  if (onProgress) {
    await onProgress(0, totalCount, 0);
  }

  for (const addressData of addressesWithBalances) {
    try {
      console.log(`\n🔄 Processando ${addressData.address}...`);

      const result = await processAddress(
        addressData,
        globalWallet,
        globalAddress
      );

      results.push(result);

      console.log(`📊 Resultado processAddress: success=${result.success}, tokensTransferred=${result.tokensTransferred.join(',')}`);

      // Agrega estatísticas
      if (result.success) {
        console.log(`💾 Salvando no banco para userId: ${addressData.userId}`);
        totalMaticDistributed += parseFloat(result.maticDistributed);
        totalMaticRecovered += parseFloat(result.maticRecovered);

        for (const token of result.tokensTransferred) {
          tokensTransferred[token] = (tokensTransferred[token] || 0) + 1;
        }

        // Atualiza status das transações para SENT_TO_GLOBAL
        console.log(`💾 Atualizando WalletTransaction para userId: ${addressData.userId}`);
        const updatedCount = await prisma.walletTransaction.updateMany({
          where: {
            userId: addressData.userId,
            status: "CONFIRMED",
          },
          data: {
            status: "SENT_TO_GLOBAL",
          },
        });

        console.log(`✅ WalletTransaction atualizado: ${updatedCount.count} transações`);
        transactionsUpdated += updatedCount.count;
      }

      // Atualiza progresso após sucesso
      processedCount++;
      if (onProgress) {
        await onProgress(processedCount, totalCount, failedCount);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${addressData.address}:`, error);
      results.push({
        address: addressData.address,
        success: false,
        tokensTransferred: [],
        txHashes: [],
        maticDistributed: "0",
        maticRecovered: "0",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Atualiza progresso após falha
      processedCount++;
      failedCount++;
      if (onProgress) {
        await onProgress(processedCount, totalCount, failedCount);
      }
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

  // Agrupa dados por token e coleta txHashes confirmados on-chain
  for (const result of successfulResults) {
    for (const addressData of addressesWithBalances) {
      if (addressData.address === result.address) {
        // Agrupa valores por token
        for (const token of addressData.tokens) {
          const tokenSymbol = token.symbol;
          if (tokenSymbol === "MATIC") continue; // MATIC é tratado na Fase 3

          if (!tokenCollections[tokenSymbol]) {
            tokenCollections[tokenSymbol] = {
              totalAmount: 0,
              walletsCount: 0,
              txHashes: [],
            };
          }

          tokenCollections[tokenSymbol].totalAmount += Number(token.balance);
          tokenCollections[tokenSymbol].walletsCount += 1;
        }

        // Adiciona os txHashes confirmados on-chain
        // Estes hashes foram verificados com receipt.status === 1 na Fase 2
        // Como cada transferência ERC20 gera 1 txHash, associamos ao token principal
        for (let i = 0; i < result.tokensTransferred.length; i++) {
          const tokenSymbol = result.tokensTransferred[i];
          const txHash = result.txHashes[i];

          if (tokenSymbol && txHash && tokenSymbol !== "MATIC") {
            if (!tokenCollections[tokenSymbol]) {
              tokenCollections[tokenSymbol] = {
                totalAmount: 0,
                walletsCount: 0,
                txHashes: [],
              };
            }
            tokenCollections[tokenSymbol].txHashes.push(txHash);
          }
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
    txHashes: [],
    maticDistributed: "0",
    maticRecovered: "0",
  };

  // === FASE 1: Distribuir MATIC (estimativa dinâmica) ===
  console.log("  📤 Fase 1: Calculando MATIC necessário com gas price atual...");

  const currentMatic = await provider.getBalance(addressData.address);
  const currentMaticFormatted = parseFloat(formatEther(currentMatic));

  // Conta quantos tokens ERC20 (não MATIC) precisam ser transferidos
  const erc20Tokens = addressData.tokens.filter((t) => t.symbol !== "MATIC");

  // Calcula custo estimado com base no gas price atual da rede
  const maticNeeded = await estimateGasCostForTransfers(provider, erc20Tokens.length);

  console.log(`  📊 Estimativa dinâmica: ${maticNeeded.toFixed(6)} MATIC para ${erc20Tokens.length} transferência(s)`);

  const maticToSend = maticNeeded - currentMaticFormatted;

  if (maticToSend > MIN_MATIC_TO_SEND) {
    console.log(
      `  💸 Enviando ${maticToSend.toFixed(6)} MATIC (precisa de ${maticNeeded.toFixed(6)}, tem ${currentMaticFormatted.toFixed(6)})`
    );

    const tx = await globalWallet.sendTransaction({
      to: addressData.address,
      value: parseEther(maticToSend.toFixed(18)),
    });

    await tx.wait(1);
    result.maticDistributed = maticToSend.toFixed(6);

    console.log(`  ✅ MATIC distribuído: ${tx.hash}`);
  } else {
    console.log(
      `  ⏭️  MATIC suficiente (tem ${currentMaticFormatted.toFixed(6)}, precisa ${maticNeeded.toFixed(6)})`
    );
  }

  // === FASE 2: Transferir Tokens ===
  console.log("  📦 Fase 2: Transferindo tokens...");

  // Array para guardar os txHashes confirmados on-chain
  const confirmedTxHashes: string[] = [];

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

      console.log(`  🔄 Transferindo ${token.symbol}...`);
      const tx = await tokenContract.transfer(globalAddress, amountRaw);

      // Aguarda confirmação on-chain
      const receipt = await tx.wait(1);

      // Verifica se a transação foi bem-sucedida on-chain
      if (receipt && receipt.status === 1) {
        result.tokensTransferred.push(token.symbol);
        confirmedTxHashes.push(tx.hash);
        console.log(`  ✅ ${token.symbol} transferido e CONFIRMADO on-chain: ${tx.hash}`);
      } else {
        console.error(`  ❌ ${token.symbol} transação falhou on-chain: ${tx.hash}`);
        throw new Error(`Transaction failed on-chain: ${tx.hash}`);
      }
    } catch (error) {
      console.error(`  ❌ Erro ao transferir ${token.symbol}:`, error);
      throw error;
    }
  }

  // Salva os txHashes confirmados no resultado
  result.txHashes = confirmedTxHashes;

  // === FASE 3: Recuperar MATIC restante ===
  // Fase 3 é opcional - erros aqui não devem invalidar os tokens já transferidos
  console.log("  💰 Fase 3: Recuperando MATIC restante...");

  try {
    const finalMatic = await provider.getBalance(addressData.address);
    const finalMaticFormatted = parseFloat(formatEther(finalMatic));

    // Estima o custo de gas para transferência nativa
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 50000000000n; // 50 gwei fallback
    const gasLimit = 21000n; // Gas fixo para transferência nativa
    const estimatedGasCost = gasPrice * gasLimit;
    const gasCostFormatted = parseFloat(formatEther(estimatedGasCost));

    // Buffer de segurança (20% extra para variação de gas)
    const totalGasCost = gasCostFormatted * 1.2;

    // Só recupera se tiver saldo suficiente para cobrir gas + reserva
    const minRequired = totalGasCost + RESERVE_AFTER_TRANSFER;

    if (finalMaticFormatted > minRequired) {
      // Envia tudo menos o custo de gas (deixa margem de segurança)
      const maticToRecover = finalMaticFormatted - totalGasCost - RESERVE_AFTER_TRANSFER;

      if (maticToRecover > 0.0001) {
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
          `  ⏭️  MATIC a recuperar muito baixo (${maticToRecover.toFixed(6)} MATIC)`
        );
      }
    } else {
      console.log(
        `  ⏭️  MATIC insuficiente para recuperar (tem ${finalMaticFormatted.toFixed(4)}, precisa ${minRequired.toFixed(4)} para gas+reserva)`
      );
    }
  } catch (phase3Error) {
    // Fase 3 falhou, mas tokens já foram transferidos - não falha o processo
    console.warn(
      `  ⚠️ Fase 3 falhou (MATIC não recuperado), mas tokens foram transferidos:`,
      phase3Error instanceof Error ? phase3Error.message : phase3Error
    );
  }

  console.log(`  ✅ Endereço ${addressData.address} processado!`);

  return result;
}

/**
 * Busca todos os endereços com saldo > 0 baseado em transações REAIS (não teste)
 *
 * IMPORTANTE: Filtra por isTest: false para ignorar depósitos de teste
 * que existem no banco mas não têm tokens reais on-chain.
 */
async function getAddressesWithBalances(): Promise<AddressWithBalances[]> {
  // Busca transações CONFIRMED que NÃO são de teste
  const confirmedTransactions = await prisma.walletTransaction.findMany({
    where: {
      status: "CONFIRMED",
      isTest: false, // Ignora depósitos de teste
    },
    include: {
      depositAddress: {
        select: {
          polygonAddress: true,
          privateKey: true,
        },
      },
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  // Agrupa por userId
  const addressMap = new Map<string, AddressWithBalances>();

  for (const tx of confirmedTransactions) {
    if (!tx.depositAddress) {
      console.warn(`⚠️  Transação ${tx.id} sem endereço de depósito`);
      continue;
    }

    const key = tx.userId;

    if (!addressMap.has(key)) {
      addressMap.set(key, {
        address: tx.depositAddress.polygonAddress,
        userId: tx.userId,
        privateKey: tx.depositAddress.privateKey,
        tokens: [],
      });
    }

    const addressData = addressMap.get(key)!;

    // Encontra ou cria entrada para este token
    let tokenEntry = addressData.tokens.find(t => t.symbol === tx.tokenSymbol);

    if (!tokenEntry) {
      tokenEntry = {
        symbol: tx.tokenSymbol,
        address: tx.tokenAddress,
        decimals: tx.tokenSymbol === "MATIC" ? 18 : 6, // USDC/USDT = 6, MATIC = 18
        balance: new Decimal(0),
      };
      addressData.tokens.push(tokenEntry);
    }

    // Soma o valor da transação
    tokenEntry.balance = tokenEntry.balance.add(tx.amount);
  }

  // Filtra endereços que têm saldo > 0
  const result = Array.from(addressMap.values()).filter(addr =>
    addr.tokens.some(t => t.balance.gt(0))
  );

  console.log(`📊 Encontrados ${result.length} endereços com saldo real (não-teste)`);

  return result;
}
