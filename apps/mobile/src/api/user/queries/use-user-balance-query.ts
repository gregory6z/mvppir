import { useQuery } from "@tanstack/react-query";
import { getUserBalance, type UserBalanceResponse } from "@/api/user/client/user.api";

export function useUserBalance() {
  return useQuery<UserBalanceResponse>({
    queryKey: ["user", "balance"],
    queryFn: getUserBalance,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}
