import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

interface DepositAddress {
  polygonAddress: string
  qrCode: string
}

async function getDepositAddress(): Promise<DepositAddress> {
  return apiClient.get("deposit/my-address").json<DepositAddress>()
}

export function useDepositAddress() {
  return useQuery({
    queryKey: ["user", "deposit-address"],
    queryFn: getDepositAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes (address doesn't change often)
  })
}
