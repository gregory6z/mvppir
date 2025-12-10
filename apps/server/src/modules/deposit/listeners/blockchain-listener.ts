/**
 * Blockchain WebSocket Listener
 *
 * Listens directly to Polygon blockchain for ERC20 Transfer events.
 * Replaces Moralis webhooks with direct WebSocket connection.
 *
 * Features:
 * - Auto-reconnection on disconnect
 * - Multiple RPC fallback
 * - Adds detected deposits to BullMQ for processing
 * - Caches deposit addresses in memory for O(1) lookup
 */

import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";
import { depositsQueue } from "@/lib/queues";
import type { DepositJobData } from "@/modules/deposit/workers/deposit.worker";

// Public WebSocket RPC endpoints (no account needed)
const RPC_URLS = [
  "wss://polygon-bor-rpc.publicnode.com",
  "wss://polygon.drpc.org",
  "wss://rpc.ankr.com/polygon/ws",
];

// Token contracts to monitor (Polygon)
const MONITORED_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": { symbol: "USDC", decimals: 6 },
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": { symbol: "USDC.e", decimals: 6 },
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": { symbol: "USDT", decimals: 6 },
};

// ERC20 Transfer event ABI
const TRANSFER_EVENT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// In-memory cache of deposit addresses (Set for O(1) lookup)
let depositAddressesCache: Set<string> = new Set();
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // Refresh cache every 60 seconds

// Connection state
let provider: ethers.WebSocketProvider | null = null;
let contracts: ethers.Contract[] = [];
let currentRpcIndex = 0;
let isRunning = false;
let reconnectTimeout: NodeJS.Timeout | null = null;

/**
 * Load deposit addresses from database into memory cache
 */
async function refreshDepositAddressesCache(): Promise<void> {
  const now = Date.now();
  if (now - lastCacheUpdate < CACHE_TTL && depositAddressesCache.size > 0) {
    return; // Cache still fresh
  }

  const addresses = await prisma.depositAddress.findMany({
    where: { status: "ACTIVE" },
    select: { polygonAddress: true },
  });

  depositAddressesCache = new Set(
    addresses.map((a) => a.polygonAddress.toLowerCase())
  );
  lastCacheUpdate = now;

  console.log(
    `[Blockchain Listener] Cache refreshed: ${depositAddressesCache.size} deposit addresses`
  );
}

/**
 * Check if an address is one of our deposit addresses
 */
function isOurDepositAddress(address: string): boolean {
  return depositAddressesCache.has(address.toLowerCase());
}

/**
 * Handle a detected Transfer event
 */
async function handleTransferEvent(
  tokenAddress: string,
  from: string,
  to: string,
  value: bigint,
  event: ethers.Log
): Promise<void> {
  // Only process transfers TO our deposit addresses
  if (!isOurDepositAddress(to)) {
    return;
  }

  const token = MONITORED_TOKENS[tokenAddress.toLowerCase()];
  if (!token) {
    console.log(
      `[Blockchain Listener] Unknown token transfer detected: ${tokenAddress}`
    );
    return;
  }

  const txHash = event.transactionHash;
  const blockNumber = event.blockNumber;

  console.log(`[Blockchain Listener] 🎉 Deposit detected!`, {
    txHash,
    token: token.symbol,
    to,
    from,
    value: value.toString(),
    block: blockNumber,
  });

  // Get block timestamp
  let blockTimestamp = new Date().toISOString();
  try {
    const block = await provider?.getBlock(blockNumber);
    if (block) {
      blockTimestamp = new Date(block.timestamp * 1000).toISOString();
    }
  } catch (e) {
    console.warn(`[Blockchain Listener] Could not get block timestamp`);
  }

  // Create payload matching Moralis webhook format
  const payload = {
    confirmed: true, // WebSocket events are confirmed
    chainId: "0x89", // Polygon
    txHash,
    to: to.toLowerCase(),
    from: from.toLowerCase(),
    value: value.toString(),
    tokenAddress: tokenAddress.toLowerCase(),
    tokenName: token.symbol,
    tokenSymbol: token.symbol,
    tokenDecimals: token.decimals.toString(),
    block: {
      number: blockNumber.toString(),
      timestamp: blockTimestamp,
    },
  };

  // Add to BullMQ queue for processing
  try {
    const jobData: DepositJobData = {
      payload,
      receivedAt: new Date().toISOString(),
    };

    await depositsQueue.add(`deposit-${txHash}`, jobData, {
      jobId: `ws-${txHash}`, // Prevent duplicate processing
    });

    console.log(`[Blockchain Listener] ✅ Added to queue: ${txHash}`);
  } catch (error: any) {
    if (error.message?.includes("Job already exists")) {
      console.log(`[Blockchain Listener] Job already exists: ${txHash}`);
    } else {
      console.error(`[Blockchain Listener] Failed to add job:`, error.message);
    }
  }
}

/**
 * Setup event listeners for token contracts
 */
function setupEventListeners(): void {
  if (!provider) return;

  // Clear existing contracts
  contracts.forEach((c) => c.removeAllListeners());
  contracts = [];

  // Create contract instances and listen for Transfer events
  for (const [tokenAddress, tokenInfo] of Object.entries(MONITORED_TOKENS)) {
    const contract = new ethers.Contract(
      tokenAddress,
      TRANSFER_EVENT_ABI,
      provider
    );

    contract.on("Transfer", (from: string, to: string, value: bigint, event: ethers.ContractEventPayload) => {
      handleTransferEvent(tokenAddress, from, to, value, event.log).catch(
        (err) => {
          console.error(`[Blockchain Listener] Error handling event:`, err);
        }
      );
    });

    contracts.push(contract);
    console.log(
      `[Blockchain Listener] Listening to ${tokenInfo.symbol} (${tokenAddress})`
    );
  }
}

/**
 * Connect to WebSocket RPC
 */
async function connect(): Promise<boolean> {
  const rpcUrl = RPC_URLS[currentRpcIndex];

  try {
    console.log(`[Blockchain Listener] Connecting to ${rpcUrl}...`);

    provider = new ethers.WebSocketProvider(rpcUrl);

    // Wait for connection
    await provider.getBlockNumber();

    console.log(`[Blockchain Listener] ✅ Connected to ${rpcUrl}`);

    // Setup disconnect handler
    const ws = provider.websocket as WebSocket;
    ws.onclose = () => {
      console.log(`[Blockchain Listener] ⚠️ WebSocket disconnected`);
      scheduleReconnect();
    };

    ws.onerror = (error: Event) => {
      console.error(`[Blockchain Listener] WebSocket error`);
    };

    // Setup event listeners
    setupEventListeners();

    return true;
  } catch (error: any) {
    console.error(
      `[Blockchain Listener] Failed to connect to ${rpcUrl}:`,
      error.message
    );
    return false;
  }
}

/**
 * Try connecting to the next RPC in the list
 */
async function tryNextRpc(): Promise<boolean> {
  for (let i = 0; i < RPC_URLS.length; i++) {
    currentRpcIndex = (currentRpcIndex + 1) % RPC_URLS.length;
    if (await connect()) {
      return true;
    }
  }
  return false;
}

/**
 * Schedule reconnection attempt
 */
function scheduleReconnect(): void {
  if (reconnectTimeout || !isRunning) return;

  console.log(`[Blockchain Listener] Reconnecting in 5 seconds...`);

  reconnectTimeout = setTimeout(async () => {
    reconnectTimeout = null;

    if (!isRunning) return;

    const connected = await tryNextRpc();
    if (!connected) {
      console.error(
        `[Blockchain Listener] All RPCs failed, retrying in 30 seconds...`
      );
      setTimeout(() => scheduleReconnect(), 30000);
    }
  }, 5000);
}

/**
 * Start the blockchain listener
 */
export async function startBlockchainListener(): Promise<void> {
  if (isRunning) {
    console.log(`[Blockchain Listener] Already running`);
    return;
  }

  isRunning = true;
  console.log(`[Blockchain Listener] Starting...`);

  // Load deposit addresses into cache
  await refreshDepositAddressesCache();

  // Setup periodic cache refresh
  setInterval(() => {
    refreshDepositAddressesCache().catch((err) => {
      console.error(`[Blockchain Listener] Cache refresh failed:`, err);
    });
  }, CACHE_TTL);

  // Connect to WebSocket
  const connected = await connect();
  if (!connected) {
    await tryNextRpc();
  }

  console.log(`✅ Blockchain Listener started`);
}

/**
 * Stop the blockchain listener
 */
export function stopBlockchainListener(): void {
  isRunning = false;

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  contracts.forEach((c) => c.removeAllListeners());
  contracts = [];

  if (provider) {
    provider.destroy();
    provider = null;
  }

  console.log(`[Blockchain Listener] Stopped`);
}

/**
 * Add a new deposit address to the cache (call when user creates new address)
 */
export function addDepositAddressToCache(address: string): void {
  depositAddressesCache.add(address.toLowerCase());
  console.log(
    `[Blockchain Listener] Added address to cache: ${address.toLowerCase()}`
  );
}

/**
 * Get listener status
 */
export function getListenerStatus(): {
  running: boolean;
  connected: boolean;
  rpcUrl: string;
  cachedAddresses: number;
} {
  return {
    running: isRunning,
    connected: provider !== null,
    rpcUrl: RPC_URLS[currentRpcIndex],
    cachedAddresses: depositAddressesCache.size,
  };
}
