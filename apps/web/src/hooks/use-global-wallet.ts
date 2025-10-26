"use client"

import { useQuery } from "@tanstack/react-query"

interface GlobalWalletBalance {
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

export function useGlobalWallet() {
  return useQuery<GlobalWalletBalance>({
    queryKey: ["global-wallet", "balance"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"
      const response = await fetch(`${apiUrl}/api/admin/global-wallet/balance`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Falha ao buscar saldo da carteira global")
      }

      return response.json()
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
    staleTime: 30000, // Considera dados obsoletos após 30s
  })
}
