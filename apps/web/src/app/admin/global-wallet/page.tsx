"use client"

import { useGlobalWalletBalance } from "@/lib/api/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, RefreshCw, Wallet, TrendingUp } from "lucide-react"
import { useState } from "react"

export default function GlobalWalletPage() {
  const { data, isLoading, error, refetch, isFetching } = useGlobalWalletBalance()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (data?.address) {
      await navigator.clipboard.writeText(data.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Carteira Global</h1>
          <p className="text-zinc-400">
            Visualize os saldos de todos os tokens na carteira global.
          </p>
        </div>

        <Alert variant="destructive" className="border-red-800 bg-red-900/50">
          <AlertDescription>
            Erro ao carregar saldos da carteira global. Tente novamente.
          </AlertDescription>
        </Alert>

        <Button onClick={handleRefresh} variant="outline" className="w-fit">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Carteira Global</h1>
          <p className="text-zinc-400">
            Visualize os saldos de todos os tokens na carteira global.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isFetching}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      {/* Global Wallet Address */}
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Endereço da Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm text-zinc-300 font-mono break-all">
                {data?.address}
              </code>
              <Button
                onClick={handleCopyAddress}
                variant="ghost"
                size="sm"
                className="shrink-0"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Balance */}
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <Card className="border-zinc-800 bg-gradient-to-br from-purple-900/20 to-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Valor Total
            </CardTitle>
            <CardDescription>Soma de todos os tokens em USD</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              ${data?.totalUsd || "0.00"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Balances Table */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Saldos por Token</CardTitle>
          <CardDescription>Todos os tokens na carteira global</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : data?.balances && data.balances.length > 0 ? (
            <div className="space-y-4">
              {data.balances.map((balance) => (
                <div
                  key={balance.tokenSymbol}
                  className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950/50"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-white">
                        {balance.tokenSymbol}
                      </span>
                      {balance.tokenAddress && (
                        <code className="text-xs text-zinc-500">
                          {balance.tokenAddress.slice(0, 6)}...{balance.tokenAddress.slice(-4)}
                        </code>
                      )}
                    </div>
                    <span className="text-sm text-zinc-400">
                      Atualizado: {new Date(balance.lastUpdated).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xl font-bold text-white">
                      {Number(balance.balance).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </span>
                    <span className="text-sm text-green-400">
                      ${Number(balance.usdValue).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Nenhum token encontrado na carteira global</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
