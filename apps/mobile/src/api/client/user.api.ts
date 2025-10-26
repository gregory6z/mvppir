const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Erro desconhecido",
    }));
    throw new Error(error.message || "Falha na requisição");
  }

  return response.json();
}

// User API Services
export interface UserBalance {
  tokenSymbol: string;
  tokenAddress: string | null;
  balance: string;
  usdValue: string;
  lastUpdated: string;
}

export async function getUserBalance(): Promise<{ balances: UserBalance[] }> {
  return request<{ balances: UserBalance[] }>("/user/balance");
}

export interface Transaction {
  id: string;
  txHash: string;
  tokenSymbol: string;
  amount: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  status: "PENDING" | "CONFIRMED" | "SENT_TO_GLOBAL";
  createdAt: string;
}

export async function getUserTransactions(): Promise<{ transactions: Transaction[] }> {
  return request<{ transactions: Transaction[] }>("/user/transactions");
}
