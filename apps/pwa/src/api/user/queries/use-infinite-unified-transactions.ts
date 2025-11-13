import { useInfiniteQuery } from "@tanstack/react-query"
import { getUnifiedTransactions } from "../client"

const TRANSACTIONS_PER_PAGE = 20

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
        return lastPage.pagination.offset + lastPage.pagination.limit
      }
      return undefined
    },
    initialPageParam: 0,
    staleTime: 1000 * 30, // 30 seconds
  })
}
