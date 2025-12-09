import { useQuery } from "@tanstack/react-query"
import { getGlobalWalletBalance } from "@/api/client/admin.api"
import { queryKeys } from "@/lib/react-query"

export interface GlobalWalletBalance {
  address: string
  balances: Array<{
    tokenSymbol: string
    tokenAddress: string | null
    balance: string
    usdValue: string
    lastUpdated: string
  }>
  totalUsd: string
  maticBalance: string
  maticUsdValue: string
}

export function useGlobalWalletBalance() {
  return useQuery<GlobalWalletBalance>({
    queryKey: queryKeys.admin.globalWallet(),
    queryFn: () => getGlobalWalletBalance(),
    refetchInterval: 60000, // Atualiza a cada 1 minuto
    staleTime: 30000, // Considera dados obsoletos após 30s
  })
}
