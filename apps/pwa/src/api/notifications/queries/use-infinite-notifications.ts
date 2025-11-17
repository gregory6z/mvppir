import { useInfiniteQuery } from "@tanstack/react-query"
import { getUnreadNotifications } from "../client"

export function useInfiniteNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications", "unread", "infinite"],
    queryFn: ({ pageParam }) =>
      getUnreadNotifications({
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  })
}
