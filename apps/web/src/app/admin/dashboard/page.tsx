"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Fuel,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { useGlobalWalletBalance } from "@/api/queries/admin/use-global-wallet-query"
import { useWithdrawals } from "@/api/queries/admin/use-withdrawals-query"
import { useBatchCollectPreview } from "@/api/queries/admin/use-batch-collect-query"

export default function DashboardPage() {
  const { data: globalWalletData, isLoading: isLoadingWallet } = useGlobalWalletBalance()
  const { data: pendingWithdrawalsData, isLoading: isLoadingWithdrawals } = useWithdrawals("PENDING_APPROVAL", 1, 50)
  const { data: batchCollectData, isLoading: isLoadingBatchCollect } = useBatchCollectPreview()

  // Calculate metrics
  const totalBalanceUSD = Number(globalWalletData?.totalUsd || 0)
  const maticBalance = globalWalletData?.balances.find((b) => b.tokenSymbol === "MATIC")?.balance || "0"
  const pendingWithdrawalsCount = pendingWithdrawalsData?.withdrawals.length || 0
  const tokensToCollectValue = batchCollectData?.totalValueUsd || 0
  const tokensToCollectCount = batchCollectData?.tokens.length || 0

  // Calculate pending withdrawals total value
  const pendingWithdrawalsValue = pendingWithdrawalsData?.withdrawals.reduce((sum, w) => {
    return sum + Number(w.amount)
  }, 0) || 0

  // Available for withdrawal = Total Balance - Pending Withdrawals
  const availableForWithdrawal = totalBalanceUSD - pendingWithdrawalsValue

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-zinc-400">
          Visão geral da plataforma e métricas em tempo real
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* 1. Global Wallet Balance - Total disponível */}
        {isLoadingWallet ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Card className="border-zinc-800 bg-gradient-to-br from-blue-900/20 to-zinc-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-200">Saldo Total</CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${totalBalanceUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-zinc-400 mt-1">Carteira Global</p>
            </CardContent>
          </Card>
        )}

        {/* 2. Available for Withdrawal - O que pode sacar */}
        {isLoadingWallet || isLoadingWithdrawals ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Card className="border-zinc-800 bg-gradient-to-br from-emerald-900/20 to-zinc-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-200">Disponível</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${availableForWithdrawal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-emerald-400 mt-1">Para saque</p>
            </CardContent>
          </Card>
        )}

        {/* 3. Pending Withdrawals - O que está bloqueado */}
        {isLoadingWithdrawals ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Link href="/admin/withdrawals">
            <Card className="border-zinc-800 bg-gradient-to-br from-red-900/20 to-zinc-900/50 backdrop-blur hover:border-red-500/50 transition-all duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-200">Bloqueado</CardTitle>
                <Clock className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ${pendingWithdrawalsValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-red-400 mt-1">
                  {pendingWithdrawalsCount} {pendingWithdrawalsCount === 1 ? "saque pendente" : "saques pendentes"}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* 4. Tokens to Collect - O que ainda está com usuários */}
        {isLoadingBatchCollect ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Link href="/admin/batch-collect">
            <Card className="border-zinc-800 bg-gradient-to-br from-purple-900/20 to-zinc-900/50 backdrop-blur hover:border-purple-500/50 transition-all duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-200">A Coletar</CardTitle>
                <ArrowLeftRight className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ${tokensToCollectValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-purple-400 mt-1">
                  {tokensToCollectCount} {tokensToCollectCount === 1 ? "token" : "tokens"}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* 5. MATIC Balance - Para gas fees */}
        {isLoadingWallet ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Card className="border-zinc-800 bg-gradient-to-br from-green-900/20 to-zinc-900/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-200">MATIC</CardTitle>
              <Fuel className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Number(maticBalance).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-green-400 mt-1">Gas disponível</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Global Wallet Breakdown */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Composição da Carteira Global
            </CardTitle>
            <CardDescription>Saldo por token</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingWallet ? (
              <Skeleton className="h-32 w-full" />
            ) : globalWalletData?.balances && globalWalletData.balances.length > 0 ? (
              <div className="space-y-3">
                {globalWalletData.balances.map((balance) => (
                  <div key={balance.tokenSymbol} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{balance.tokenSymbol}</p>
                      <p className="text-xs text-zinc-500">
                        {Number(balance.balance).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-400">
                        ${Number(balance.usdValue).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-8">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Nenhum saldo disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Collect Preview */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Tokens Aguardando Coleta
            </CardTitle>
            <CardDescription>Fundos em carteiras de usuários</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBatchCollect ? (
              <Skeleton className="h-32 w-full" />
            ) : batchCollectData?.tokens && batchCollectData.tokens.length > 0 ? (
              <div className="space-y-3">
                {batchCollectData.tokens.slice(0, 5).map((token) => (
                  <div key={token.tokenSymbol} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{token.tokenSymbol}</p>
                      <p className="text-xs text-zinc-500">
                        {token.walletsCount} {token.walletsCount === 1 ? "carteira" : "carteiras"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-400">
                        ${token.valueUsd?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || "0.00"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {Number(token.totalAmount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {batchCollectData.tokens.length > 5 && (
                  <p className="text-xs text-zinc-500 text-center pt-2">
                    +{batchCollectData.tokens.length - 5} tokens adicionais
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-8">
                <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Nenhum token para coletar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/withdrawals">
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur hover:border-yellow-500/50 transition-all duration-200 cursor-pointer group h-full">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-200 group-hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Gerenciar Saques
                </CardTitle>
                <CardDescription className="text-xs">
                  {pendingWithdrawalsCount > 0
                    ? `${pendingWithdrawalsCount} ${pendingWithdrawalsCount === 1 ? "saque pendente" : "saques pendentes"}`
                    : "Nenhum saque pendente"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/batch-collect">
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur hover:border-purple-500/50 transition-all duration-200 cursor-pointer group h-full">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-200 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Coleta em Lote
                </CardTitle>
                <CardDescription className="text-xs">
                  {tokensToCollectCount > 0
                    ? `${tokensToCollectCount} ${tokensToCollectCount === 1 ? "token disponível" : "tokens disponíveis"}`
                    : "Nenhum token para coletar"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/global-wallet">
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur hover:border-blue-500/50 transition-all duration-200 cursor-pointer group h-full">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Carteira Global
                </CardTitle>
                <CardDescription className="text-xs">
                  Ver detalhes e transações
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            Status do Sistema
          </CardTitle>
          <CardDescription>Todos os sistemas operacionais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Servidor API</span>
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Banco de Dados</span>
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  Conectado
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Blockchain RPC</span>
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  Ativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Workers</span>
                <span className="flex items-center gap-2 text-sm text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  Executando
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
