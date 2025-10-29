import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface UserStatus {
  status: "INACTIVE" | "ACTIVE" | "BLOCKED";
  totalDepositsUsd: string;
  activationThreshold: string;
  activationProgress: number; // 0-100
}

async function getUserStatus(): Promise<UserStatus> {
  return apiClient.get("user/status").json<UserStatus>();
}

export function useUserStatus() {
  return useQuery({
    queryKey: ["user", "status"],
    queryFn: getUserStatus,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}
