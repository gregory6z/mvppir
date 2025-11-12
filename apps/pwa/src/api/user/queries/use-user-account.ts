import { useQuery } from "@tanstack/react-query"
import { getUserAccount } from "../client"
import { useAuthStore } from "@/stores/auth.store"
import type { UserAccount } from "../schemas"

export function useUserAccount() {
  const { isAuthenticated } = useAuthStore()

  return useQuery<UserAccount>({
    queryKey: ["user", "account"],
    queryFn: getUserAccount,
    enabled: isAuthenticated, // Only fetch when user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
