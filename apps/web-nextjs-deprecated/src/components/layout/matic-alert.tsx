"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"

interface GlobalWalletBalance {
  totalUsd: number
  balances: Array<{
    tokenSymbol: string
    balance: string
    usdValue: string
  }>
}

export function MaticAlert() {
  const [dismissed, setDismissed] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const { data } = useQuery<GlobalWalletBalance>({
    queryKey: ["global-wallet-balance"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/global-wallet/balance`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    refetchInterval: 30000, // Refetch every 30s
  })

  // Get MATIC balance
  const maticBalance = data?.balances?.find((b) => b.tokenSymbol === "MATIC")
  const maticAmount = Number(maticBalance?.balance || 0)

  // Show alert if MATIC is 0 or very low (< 5 MATIC) and not dismissed
  const shouldShowAlert = !dismissed && maticAmount < 5

  // Handle dismiss with animation
  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setDismissed(true)
    }, 300) // Match animation duration
  }

  if (!shouldShowAlert) {
    return null
  }

  return (
    <Alert
      variant="destructive"
      className={`
        border-red-800 bg-red-900/30 text-red-200 rounded-none border-x-0 border-t-0
        transition-all duration-300 ease-in-out
        ${isExiting ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"}
      `}
    >
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex-1 flex items-center justify-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-sm font-medium">
            {maticAmount === 0 ? (
              <span>
                <strong className="text-red-100">Atenção:</strong> Saldo de MATIC está zerado.
                Não será possível processar saques nem transferências para conta global.
              </span>
            ) : (
              <span>
                <strong className="text-red-100">Aviso:</strong> Saldo de MATIC está baixo ({maticAmount.toFixed(2)} MATIC).
                Recarregue para continuar processando saques e transferências.
              </span>
            )}
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-6 w-6 text-red-200 hover:text-red-100 hover:bg-red-800/50 shrink-0 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  )
}
