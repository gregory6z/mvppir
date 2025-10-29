import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface UnifiedTransaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "COMMISSION";
  tokenSymbol: string;
  tokenAddress: string | null;
  amount: string;
  usdValue: number;
  txHash: string | null;
  transferTxHash: string | null;
  status: string;
  createdAt: string;
  // Commission specific fields
  commissionLevel?: number; // 0 = self (daily yield), 1-3 = network levels
  fromUserName?: string;
  userRank?: string;
}

export interface UnifiedTransactionsResponse {
  transactions: UnifiedTransaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface GetUnifiedTransactionsParams {
  limit?: number;
  offset?: number;
}

async function getUnifiedTransactions(
  params: GetUnifiedTransactionsParams = {}
): Promise<UnifiedTransactionsResponse> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.offset) searchParams.append("offset", params.offset.toString());

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiClient
    .get(`user/transactions/all${query}`)
    .json<UnifiedTransactionsResponse>();
}

export function useUnifiedTransactions(params: GetUnifiedTransactionsParams = {}) {
  return useQuery({
    queryKey: ["user", "transactions", "all", params],
    queryFn: () => getUnifiedTransactions(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}
