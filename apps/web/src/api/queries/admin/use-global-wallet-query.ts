"use client"

import { useQuery } from "@tanstack/react-query"
import { getGlobalWalletBalance } from "@/api/client/admin.api"

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
}

export function useGlobalWalletBalance() {
  return useQuery<GlobalWalletBalance>({
    queryKey: ["admin", "global-wallet", "balance"],
    queryFn: getGlobalWalletBalance,
    refetchInterval: 60000, // Atualiza a cada 1 minuto
    staleTime: 30000, // Considera dados obsoletos após 30s
  })
}
