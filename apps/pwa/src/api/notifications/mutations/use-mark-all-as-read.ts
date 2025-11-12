import { useMutation, useQueryClient } from "@tanstack/react-query"
import { markAllNotificationsAsRead } from "../client"

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate and refetch unread notifications
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] })
    },
  })
}
