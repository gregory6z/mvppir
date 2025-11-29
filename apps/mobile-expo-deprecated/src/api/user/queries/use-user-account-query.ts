import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  status: "INACTIVE" | "ACTIVE" | "BLOCKED";
  activatedAt: string | null;
  createdAt: string;
  referralCode: string;
}

async function getUserAccount(): Promise<UserAccount> {
  return apiClient.get("user/account").json<UserAccount>();
}

export function useUserAccount() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["user", "account"],
    queryFn: getUserAccount,
    enabled: isAuthenticated, // Only fetch when user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
