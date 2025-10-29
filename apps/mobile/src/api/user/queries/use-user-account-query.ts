import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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
  return useQuery({
    queryKey: ["user", "account"],
    queryFn: getUserAccount,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
