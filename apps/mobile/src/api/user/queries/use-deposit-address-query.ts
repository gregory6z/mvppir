import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface DepositAddress {
  id: string;
  polygonAddress: string;
  qrCode: string; // Base64 data URL
  createdAt: string;
}

async function getDepositAddress(): Promise<DepositAddress> {
  return apiClient.get("deposit/my-address").json<DepositAddress>();
}

export function useDepositAddress() {
  return useQuery({
    queryKey: ["deposit", "address"],
    queryFn: getDepositAddress,
    staleTime: 1000 * 60 * 60, // 1 hour (address doesn't change)
  });
}
