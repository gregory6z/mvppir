import { useMutation, useQueryClient } from "@tanstack/react-query"
import { markNotificationAsRead } from "../client"

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidate and refetch unread notifications
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] })
    },
  })
}
