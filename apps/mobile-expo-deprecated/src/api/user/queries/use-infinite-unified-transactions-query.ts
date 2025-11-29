import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { UnifiedTransaction, UnifiedTransactionsResponse } from "./use-unified-transactions-query";

const TRANSACTIONS_PER_PAGE = 20;

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

export function useInfiniteUnifiedTransactions() {
  return useInfiniteQuery({
    queryKey: ["user", "transactions", "infinite"],
    queryFn: ({ pageParam = 0 }) =>
      getUnifiedTransactions({
        limit: TRANSACTIONS_PER_PAGE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 30, // 30 seconds
  });
}
