import { createFileRoute } from "@tanstack/react-router"
import { useGlobalWalletBalance } from "@/api/queries/admin/use-global-wallet-query"
import { useWithdrawals } from "@/api/queries/admin/use-withdrawals-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowUpRight, Clock, DollarSign } from "lucide-react"

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: walletData, isLoading: walletLoading } = useGlobalWalletBalance()
  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useWithdrawals("PENDING_APPROVAL")

  const isLoading = walletLoading || withdrawalsLoading

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-2">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total USD */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Valor Total (USD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `$${parseFloat(walletData?.totalUsd || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Na carteira global
            </p>
          </CardContent>
        </Card>

        {/* Tokens Count */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Tokens
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                walletData?.balances?.length || 0
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Diferentes tokens
            </p>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Saques Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                pendingWithdrawals?.pagination?.total || 0
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        {/* Wallet Address */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Carteira Global
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono text-white truncate">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                walletData?.address ? `${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}` : "N/A"
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Endereço Polygon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Balances */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Saldos por Token</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />
              ))}
            </div>
          ) : walletData?.balances && walletData.balances.length > 0 ? (
            <div className="space-y-3">
              {walletData.balances.map((token) => (
                <div
                  key={token.tokenSymbol}
                  className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {token.tokenSymbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{token.tokenSymbol}</p>
                      <p className="text-xs text-zinc-500 font-mono">
                        {token.tokenAddress ? `${token.tokenAddress.slice(0, 10)}...` : "Native"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {parseFloat(token.balance).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                    </p>
                    <p className="text-xs text-green-400">
                      ${parseFloat(token.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">Nenhum saldo encontrado</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Pending Withdrawals */}
      {pendingWithdrawals?.withdrawals && pendingWithdrawals.withdrawals.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Saques Pendentes de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingWithdrawals.withdrawals.slice(0, 5).map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{withdrawal.user.email}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(withdrawal.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {parseFloat(withdrawal.amount).toLocaleString("en-US", { maximumFractionDigits: 6 })} {withdrawal.tokenSymbol}
                    </p>
                    <p className="text-xs text-yellow-400">Pendente</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
