import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useMyWithdrawals } from "@/api/queries/user/use-user-queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Wallet,
} from "lucide-react"

export const Route = createFileRoute("/app/withdrawals")({
  component: WithdrawalsPage,
})

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING_APPROVAL: {
    label: "Pendente",
    color: "text-yellow-400 bg-yellow-400/10",
    icon: <Clock className="h-4 w-4" />,
  },
  APPROVED: {
    label: "Aprovado",
    color: "text-blue-400 bg-blue-400/10",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  PROCESSING: {
    label: "Processando",
    color: "text-purple-400 bg-purple-400/10",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  COMPLETED: {
    label: "Concluído",
    color: "text-green-400 bg-green-400/10",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  REJECTED: {
    label: "Rejeitado",
    color: "text-red-400 bg-red-400/10",
    icon: <XCircle className="h-4 w-4" />,
  },
  FAILED: {
    label: "Falhou",
    color: "text-red-400 bg-red-400/10",
    icon: <AlertCircle className="h-4 w-4" />,
  },
}

function WithdrawalsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMyWithdrawals(page, 10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Meus Saques</h1>
        <p className="text-zinc-400 mt-2">Acompanhe suas solicitações de saque</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-500" />
            Histórico de Saques
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
                <div key={i} className="h-24 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data?.withdrawals && data.withdrawals.length > 0 ? (
            <div className="space-y-4">
              {data.withdrawals.map((withdrawal) => {
                const status = statusLabels[withdrawal.status] || statusLabels.PENDING_APPROVAL

                return (
                  <div
                    key={withdrawal.id}
                    className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {new Date(withdrawal.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-zinc-500">Token</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {withdrawal.tokenSymbol.slice(0, 2)}
                              </div>
                              <span className="font-medium text-white">{withdrawal.tokenSymbol}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Quantidade</p>
                            <p className="font-medium text-white mt-1">
                              {parseFloat(withdrawal.amount).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Taxa</p>
                            <p className="text-yellow-400 mt-1">
                              -{parseFloat(withdrawal.fee).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Destino</p>
                            <code className="text-xs text-zinc-400 font-mono mt-1 block">
                              {withdrawal.destinationAddress.slice(0, 8)}...{withdrawal.destinationAddress.slice(-6)}
                            </code>
                          </div>
                        </div>

                        {withdrawal.txHash && (
                          <div className="mt-3 pt-3 border-t border-zinc-800">
                            <a
                              href={`https://polygonscan.com/tx/${withdrawal.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                            >
                              Ver transação na blockchain
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}

                        {withdrawal.rejectedReason && (
                          <div className="mt-3 p-3 bg-red-950/30 rounded border border-red-900/30">
                            <p className="text-xs text-red-400">
                              <strong>Motivo:</strong> {withdrawal.rejectedReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

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
              <Wallet className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhum saque realizado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Legenda de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-400/10">
                <Clock className="h-3 w-3" />
                Pendente
              </span>
              <span className="text-xs text-zinc-500">Aguardando aprovação</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-400/10">
                <Loader2 className="h-3 w-3" />
                Processando
              </span>
              <span className="text-xs text-zinc-500">Sendo enviado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10">
                <CheckCircle className="h-3 w-3" />
                Concluído
              </span>
              <span className="text-xs text-zinc-500">Enviado com sucesso</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
