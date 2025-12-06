import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useTransactions } from "@/api/queries/user/use-user-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  History,
  ExternalLink,
} from "lucide-react"

export const Route = createFileRoute("/app/transactions")({
  component: TransactionsPage,
})

const typeLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DEPOSIT: {
    label: "Depósito",
    color: "text-green-400 bg-green-400/10",
    icon: <ArrowDownToLine className="h-4 w-4" />,
  },
  WITHDRAWAL: {
    label: "Saque",
    color: "text-red-400 bg-red-400/10",
    icon: <ArrowUpFromLine className="h-4 w-4" />,
  },
  COMMISSION: {
    label: "Comissão",
    color: "text-blue-400 bg-blue-400/10",
    icon: <TrendingUp className="h-4 w-4" />,
  },
}

function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useTransactions(
    page,
    20,
    typeFilter === "ALL" ? undefined : typeFilter
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transações</h1>
          <p className="text-zinc-400 mt-2">Histórico completo de movimentações</p>
        </div>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-48 bg-zinc-900 border-zinc-700 text-zinc-300">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="DEPOSIT">Depósitos</SelectItem>
            <SelectItem value="WITHDRAWAL">Saques</SelectItem>
            <SelectItem value="COMMISSION">Comissões</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5 text-purple-500" />
            Histórico de Transações
            {data?.pagination && (
              <span className="text-sm font-normal text-zinc-500 ml-2">
                ({data.pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data?.transactions && data.transactions.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Data</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Token</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium">Quantidade</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium">Valor USD</th>
                      <th className="text-center py-3 px-4 text-zinc-400 font-medium">TX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx) => {
                      const typeInfo = typeLabels[tx.type] || typeLabels.DEPOSIT

                      return (
                        <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className="py-4 px-4">
                            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit ${typeInfo.color}`}>
                              {typeInfo.icon}
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-zinc-300 text-sm">
                              {new Date(tx.createdAt).toLocaleString("pt-BR")}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {tx.tokenSymbol.slice(0, 2)}
                              </div>
                              <span className="font-medium text-white">{tx.tokenSymbol}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-medium ${tx.type === "WITHDRAWAL" ? "text-red-400" : "text-green-400"}`}>
                              {tx.type === "WITHDRAWAL" ? "-" : "+"}
                              {parseFloat(tx.amount).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-zinc-300">
                              ${parseFloat(tx.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {tx.txHash ? (
                              <a
                                href={`https://polygonscan.com/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              <span className="text-zinc-600">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {data.transactions.map((tx) => {
                  const typeInfo = typeLabels[tx.type] || typeLabels.DEPOSIT

                  return (
                    <div
                      key={tx.id}
                      className="p-4 bg-zinc-800/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(tx.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {tx.tokenSymbol.slice(0, 2)}
                          </div>
                          <span className="font-medium text-white">{tx.tokenSymbol}</span>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${tx.type === "WITHDRAWAL" ? "text-red-400" : "text-green-400"}`}>
                            {tx.type === "WITHDRAWAL" ? "-" : "+"}
                            {parseFloat(tx.amount).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                          </p>
                          <p className="text-xs text-zinc-500">
                            ${parseFloat(tx.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      {tx.txHash && (
                        <a
                          href={`https://polygonscan.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Ver na blockchain
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    Página {data.pagination.page} de {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-zinc-700 text-zinc-300"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pagination.totalPages}
                      className="border-zinc-700 text-zinc-300"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhuma transação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
