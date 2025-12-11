/**
 * Global Wallet Listener
 *
 * Monitors incoming transfers to the Global Wallet via WebSocket.
 * Used to confirm batch collect transactions.
 *
 * Features:
 * - Auto-reconnection on disconnect
 * - Multiple RPC fallback
 * - Confirms batch collect transfers
 */

import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";

// Public WebSocket RPC endpoints
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

// Global Wallet address cache
let globalWalletAddress: string | null = null;

// Connection state
let provider: ethers.WebSocketProvider | null = null;
let contracts: ethers.Contract[] = [];
let currentRpcIndex = 0;
let isRunning = false;
let reconnectTimeout: NodeJS.Timeout | null = null;

/**
 * Load Global Wallet address from database
 */
async function loadGlobalWalletAddress(): Promise<void> {
  const globalWallet = await prisma.globalWallet.findFirst({
    select: { polygonAddress: true },
  });

  if (!globalWallet) {
    console.warn("[Global Wallet Listener] No global wallet found in database");
    return;
  }

  globalWalletAddress = globalWallet.polygonAddress.toLowerCase();
  console.log(
    `[Global Wallet Listener] Monitoring: ${globalWalletAddress}`
  );
}

/**
 * Check if transfer is to our Global Wallet
 */
function isTransferToGlobalWallet(to: string): boolean {
  return globalWalletAddress !== null && to.toLowerCase() === globalWalletAddress;
}

/**
 * Handle incoming transfer to Global Wallet
 */
async function handleTransferToGlobalWallet(
  tokenAddress: string,
  from: string,
  to: string,
  value: bigint,
  event: ethers.Log
): Promise<void> {
  // Only process transfers TO Global Wallet
  if (!isTransferToGlobalWallet(to)) {
    return;
  }

  const token = MONITORED_TOKENS[tokenAddress.toLowerCase()];
  if (!token) {
    return; // Unknown token, ignore
  }

  const txHash = event.transactionHash;
  const amount = ethers.formatUnits(value, token.decimals);

  console.log(`[Global Wallet Listener] 💰 Received ${amount} ${token.symbol} from ${from.slice(0, 10)}... (tx: ${txHash.slice(0, 10)}...)`);
}

/**
 * Setup event listeners for token contracts
 */
function setupEventListeners(): void {
  if (!provider || !globalWalletAddress) return;

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
      handleTransferToGlobalWallet(tokenAddress, from, to, value, event.log).catch(
        (err) => {
          console.error("[Global Wallet Listener] Error handling event:", err);
        }
      );
    });

    contracts.push(contract);
  }

  console.log(`[Global Wallet Listener] Listening to ${Object.keys(MONITORED_TOKENS).length} tokens`);
}

/**
 * Connect to WebSocket RPC
 */
async function connect(): Promise<boolean> {
  const rpcUrl = RPC_URLS[currentRpcIndex];

  try {
    console.log(`[Global Wallet Listener] Connecting to ${rpcUrl}...`);

    provider = new ethers.WebSocketProvider(rpcUrl);

    // Wait for connection
    await provider.getBlockNumber();

    console.log(`[Global Wallet Listener] ✅ Connected`);

    // Setup disconnect handler
    const ws = provider.websocket as WebSocket;
    ws.onclose = () => {
      console.log(`[Global Wallet Listener] ⚠️ Disconnected`);
      scheduleReconnect();
    };

    ws.onerror = () => {
      console.error(`[Global Wallet Listener] WebSocket error`);
    };

    // Setup event listeners
    setupEventListeners();

    return true;
  } catch (error: any) {
    console.error(
      `[Global Wallet Listener] Failed to connect:`,
      error.message
    );
    return false;
  }
}

/**
 * Try connecting to the next RPC
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

  console.log(`[Global Wallet Listener] Reconnecting in 5 seconds...`);

  reconnectTimeout = setTimeout(async () => {
    reconnectTimeout = null;

    if (!isRunning) return;

    const connected = await tryNextRpc();
    if (!connected) {
      console.error(
        `[Global Wallet Listener] All RPCs failed, retrying in 30 seconds...`
      );
      setTimeout(() => scheduleReconnect(), 30000);
    }
  }, 5000);
}

/**
 * Start the Global Wallet listener
 */
export async function startGlobalWalletListener(): Promise<void> {
  if (isRunning) {
    console.log(`[Global Wallet Listener] Already running`);
    return;
  }

  isRunning = true;
  console.log(`[Global Wallet Listener] Starting...`);

  // Load Global Wallet address
  await loadGlobalWalletAddress();

  if (!globalWalletAddress) {
    console.warn(`[Global Wallet Listener] No global wallet configured, skipping`);
    isRunning = false;
    return;
  }

  // Connect to WebSocket
  const connected = await connect();
  if (!connected) {
    await tryNextRpc();
  }

  console.log(`✅ Global Wallet Listener started`);
}

/**
 * Stop the Global Wallet listener
 */
export function stopGlobalWalletListener(): void {
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

  console.log(`[Global Wallet Listener] Stopped`);
}

/**
 * Get listener status
 */
export function getGlobalWalletListenerStatus(): {
  running: boolean;
  connected: boolean;
  globalWallet: string | null;
} {
  return {
    running: isRunning,
    connected: provider !== null,
    globalWallet: globalWalletAddress,
  };
}
