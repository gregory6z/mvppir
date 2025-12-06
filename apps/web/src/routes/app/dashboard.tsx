import { createFileRoute, Link } from "@tanstack/react-router"
import { useAccount, useBalance, useActivationStatus, useTransactions } from "@/api/queries/user/use-user-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: account, isLoading: accountLoading } = useAccount()
  const { data: balance, isLoading: balanceLoading } = useBalance()
  const { data: activation, isLoading: activationLoading } = useActivationStatus()
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(1, 5)

  const isLoading = accountLoading || balanceLoading || activationLoading

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Olá, {account?.name?.split(" ")[0] || "Usuário"}!
          </h1>
          <p className="text-zinc-400 mt-1">Bem-vindo ao seu painel de controle</p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/deposit">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Depositar
            </Button>
          </Link>
          <Link to="/app/withdraw">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Sacar
            </Button>
          </Link>
        </div>
      </div>

      {/* Activation Alert */}
      {activation && !activation.isActivated && (
        <Card className="bg-yellow-950/30 border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-400">Conta não ativada</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Deposite pelo menos ${parseFloat(activation.requiredDeposit).toFixed(2)} USD para ativar sua conta e começar a receber comissões.
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Progresso</span>
                    <span className="text-yellow-400">{activation.progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${Math.min(activation.progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    ${parseFloat(activation.currentDeposit).toFixed(2)} / ${parseFloat(activation.requiredDeposit).toFixed(2)} USD
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `$${parseFloat(balance?.totalUsdValue || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Valor em USD</p>
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Disponível</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `$${balance?.balances
                  .reduce((acc, b) => acc + parseFloat(b.usdValue || "0") * (parseFloat(b.availableBalance) / parseFloat(b.totalBalance || "1")), 0)
                  .toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}`
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Para saque</p>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Status</CardTitle>
            {account?.status === "ACTIVE" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${account?.status === "ACTIVE" ? "text-green-400" : "text-yellow-400"}`}>
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : account?.status === "ACTIVE" ? (
                "Ativo"
              ) : (
                "Pendente"
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {account?.status === "ACTIVE" ? "Conta ativada" : "Aguardando ativação"}
            </p>
          </CardContent>
        </Card>

        {/* Tokens */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Tokens</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                balance?.balances.length || 0
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Diferentes ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Balances by Token */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Saldos por Token</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : balance?.balances && balance.balances.length > 0 ? (
            <div className="space-y-3">
              {balance.balances.map((token) => (
                <div
                  key={token.tokenSymbol}
                  className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {token.tokenSymbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{token.tokenSymbol}</p>
                      <p className="text-xs text-zinc-500">
                        Disponível: {parseFloat(token.availableBalance).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                        {parseFloat(token.lockedBalance) > 0 && (
                          <span className="text-yellow-500 ml-2">
                            (Bloqueado: {parseFloat(token.lockedBalance).toLocaleString("en-US", { maximumFractionDigits: 6 })})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {parseFloat(token.totalBalance).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                    </p>
                    <p className="text-xs text-green-400">
                      ${parseFloat(token.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhum saldo encontrado</p>
              <Link to="/app/deposit">
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                  Fazer primeiro depósito
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Transações Recentes</CardTitle>
          <Link to="/app/transactions">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              Ver todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : transactions?.transactions && transactions.transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "DEPOSIT" ? "bg-green-500/20" :
                      tx.type === "WITHDRAWAL" ? "bg-red-500/20" :
                      "bg-blue-500/20"
                    }`}>
                      {tx.type === "DEPOSIT" ? (
                        <ArrowDownToLine className="h-5 w-5 text-green-400" />
                      ) : tx.type === "WITHDRAWAL" ? (
                        <ArrowUpFromLine className="h-5 w-5 text-red-400" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {tx.type === "DEPOSIT" ? "Depósito" :
                         tx.type === "WITHDRAWAL" ? "Saque" :
                         "Comissão"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(tx.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      tx.type === "WITHDRAWAL" ? "text-red-400" : "text-green-400"
                    }`}>
                      {tx.type === "WITHDRAWAL" ? "-" : "+"}
                      {parseFloat(tx.amount).toLocaleString("en-US", { maximumFractionDigits: 6 })} {tx.tokenSymbol}
                    </p>
                    <p className="text-xs text-zinc-500">
                      ${parseFloat(tx.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500">Nenhuma transação ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
