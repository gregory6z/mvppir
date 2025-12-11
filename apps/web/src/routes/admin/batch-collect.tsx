import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import {
  useBatchCollectPreview,
  useExecuteBatchCollect,
  useBatchCollectHistory,
  useBatchCollectJobStatus,
  useActiveBatchCollectJob,
  useClearBatchCollectJobs,
} from "@/api/queries/admin/use-batch-collect-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeftRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Fuel,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/admin/batch-collect")({
  component: BatchCollectPage,
})

function BatchCollectPage() {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  const { data: preview, isLoading: previewLoading, refetch: refetchPreview } = useBatchCollectPreview()
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useBatchCollectHistory()
  const { data: jobStatus } = useBatchCollectJobStatus(activeJobId, !!activeJobId)
  const { data: activeJobData } = useActiveBatchCollectJob()
  const executeMutation = useExecuteBatchCollect()
  const clearJobsMutation = useClearBatchCollectJobs()

  const handleClearJobs = async () => {
    try {
      const result = await clearJobsMutation.mutateAsync()
      setActiveJobId(null)
      toast.success(`${result.removedCount} jobs removidos`, {
        description: result.message,
      })
    } catch (error) {
      toast.error("Erro ao limpar jobs")
    }
  }

  // Recupera job ativo ao carregar a página
  useEffect(() => {
    if (activeJobData?.hasActiveJob && activeJobData.job && !activeJobId) {
      setActiveJobId(activeJobData.job.jobId)
    }
  }, [activeJobData, activeJobId])

  const handleExecute = async () => {
    try {
      const result = await executeMutation.mutateAsync()
      setActiveJobId(result.jobId)
      setConfirmDialogOpen(false)
      toast.success("Coleta em lote iniciada!")
    } catch (error) {
      toast.error("Erro ao iniciar coleta")
    }
  }

  // Handle job completion
  const [notifiedJobId, setNotifiedJobId] = useState<string | null>(null)

  if (jobStatus && activeJobId && activeJobId !== notifiedJobId) {
    if (jobStatus.status === "COMPLETED") {
      toast.success("Coleta concluída com sucesso!", {
        description: `${jobStatus.progress.completed} endereços processados`,
        duration: 5000,
      })
      setNotifiedJobId(activeJobId)
      refetchPreview() // Auto-refresh preview
      refetchHistory() // Auto-refresh history
      setTimeout(() => setActiveJobId(null), 5000)
    } else if (jobStatus.status === "FAILED") {
      toast.error("Coleta falhou!", {
        description: `${jobStatus.progress.failed} falhas de ${jobStatus.progress.total}`,
        duration: 5000,
      })
      setNotifiedJobId(activeJobId)
      refetchPreview() // Auto-refresh preview
      refetchHistory() // Auto-refresh history
      setTimeout(() => setActiveJobId(null), 5000)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coleta em Lote</h1>
          <p className="text-zinc-400 mt-2">Consolidar fundos das carteiras de usuários</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearJobs}
            disabled={clearJobsMutation.isPending}
            className="border-red-800 text-red-400 hover:bg-red-950/50"
          >
            {clearJobsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Limpar Jobs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPreview()}
            disabled={previewLoading}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${previewLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Active Job Status */}
      {activeJobId && jobStatus && (
        <Card className="bg-blue-950/30 border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {jobStatus.status === "PENDING" || jobStatus.status === "IN_PROGRESS" ? (
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              ) : jobStatus.status === "COMPLETED" ? (
                <CheckCircle className="h-8 w-8 text-green-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-400" />
              )}
              <div>
                <p className="font-medium text-white">
                  {jobStatus.status === "PENDING" && "Aguardando..."}
                  {jobStatus.status === "IN_PROGRESS" && "Processando coleta..."}
                  {jobStatus.status === "COMPLETED" && "Coleta concluída!"}
                  {jobStatus.status === "FAILED" && "Coleta falhou"}
                </p>
                <p className="text-sm text-zinc-400">
                  Progresso: {jobStatus.progress.completed} / {jobStatus.progress.total}
                  {jobStatus.progress.failed > 0 && (
                    <span className="text-red-400"> ({jobStatus.progress.failed} falhas)</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-purple-500" />
            Preview da Coleta
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Tokens disponíveis para consolidação na carteira global
          </CardDescription>
        </CardHeader>
        <CardContent>
          {previewLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : preview?.tokens && preview.tokens.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Token</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium">Carteiras</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium">Total</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium">Valor USD</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium">Gas Est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.tokens.map((token) => (
                      <tr key={token.tokenSymbol} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {token.tokenSymbol.slice(0, 2)}
                            </div>
                            <span className="font-medium text-white">{token.tokenSymbol}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-zinc-300">{token.walletsCount}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-medium text-white">
                            {parseFloat(token.totalAmount).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-green-400 font-medium">
                            ${token.valueUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-xs text-zinc-500">{token.gasEstimate} MATIC</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-zinc-500">Valor Total</p>
                    <p className="text-lg font-bold text-green-400">
                      ${preview.totalValueUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Gas Total Estimado</p>
                    <p className="text-lg font-medium text-zinc-300">{preview.totalGasEstimate} MATIC</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-zinc-500">Saldo MATIC</p>
                      <p className="text-lg font-medium text-zinc-300">{preview.maticBalance}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={!preview.canExecute || executeMutation.isPending || !!activeJobId}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {executeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                  )}
                  Executar Coleta
                </Button>
              </div>

              {!preview.canExecute && (
                <div className="mt-4 p-3 bg-yellow-950/30 border border-yellow-800/50 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm text-yellow-400">
                    Saldo de MATIC insuficiente para cobrir as taxas de gas
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <ArrowLeftRight className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhum token disponível para coleta</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Coletas</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : history?.history && history.history.length > 0 ? (
            <div className="space-y-3">
              {history.history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {item.status === "COMPLETED" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : item.status === "FAILED" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-white">
                        {parseFloat(item.totalCollected).toLocaleString("en-US", { maximumFractionDigits: 6 })} {item.tokenSymbol}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.walletsCount} carteiras • {new Date(item.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "COMPLETED"
                        ? "bg-green-400/10 text-green-400"
                        : item.status === "FAILED"
                        ? "bg-red-400/10 text-red-400"
                        : "bg-yellow-400/10 text-yellow-400"
                    }`}>
                      {item.status === "COMPLETED" ? "Concluído" : item.status === "FAILED" ? "Falhou" : "Parcial"}
                    </span>
                    {item.executedBy && (
                      <p className="text-xs text-zinc-500 mt-1">por {item.executedBy.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-zinc-500">Nenhuma coleta realizada ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Coleta em Lote</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Esta ação irá transferir todos os tokens das carteiras de usuários para a carteira global.
              Esta operação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Valor Total:</span>
              <span className="text-green-400 font-medium">
                ${preview?.totalValueUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Gas Estimado:</span>
              <span className="text-zinc-300">{preview?.totalGasEstimate} MATIC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Tokens:</span>
              <span className="text-zinc-300">{preview?.tokens.length}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExecute}
              disabled={executeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {executeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmar Execução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
