"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeftRight, AlertTriangle, CheckCircle2, Fuel, RefreshCw, Loader2, Clock } from "lucide-react"
import {
  useBatchCollectPreview,
  useExecuteBatchCollect,
  useBatchCollectHistory,
  useBatchCollectJobStatus,
} from "@/api/queries/admin/use-batch-collect-query"

export default function BatchCollectPage() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  const { data, isLoading, refetch, isFetching } = useBatchCollectPreview()
  const { data: historyData, isLoading: isLoadingHistory } = useBatchCollectHistory(10)
  const executeMutation = useExecuteBatchCollect()
  const { data: jobStatus } = useBatchCollectJobStatus(currentJobId, !!currentJobId)

  const handleRefresh = () => {
    refetch()
  }

  const handleExecute = async () => {
    try {
      const result = await executeMutation.mutateAsync()
      setCurrentJobId(result.jobId)
      setShowConfirmDialog(false)
    } catch (error) {
      console.error("Error executing batch collect:", error)
    }
  }

  // Limpar jobId quando completar
  useEffect(() => {
    if (jobStatus && (jobStatus.status === "COMPLETED" || jobStatus.status === "FAILED")) {
      const timer = setTimeout(() => setCurrentJobId(null), 3000) // Limpar após 3s
      return () => clearTimeout(timer)
    }
  }, [jobStatus])

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-soft mb-2">Coleta em Lote</h1>
          <p className="text-zinc-400">
            Transferir fundos de carteiras de usuários para a Global Wallet
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isFetching}
          variant="primary"
          size="sm"
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      {/* Status Card */}
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <Card className="border-zinc-800 bg-gradient-to-br from-blue-900/20 to-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-soft flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Status da Coleta
            </CardTitle>
            <CardDescription>
              {data?.tokens && data.tokens.length > 0
                ? "Há fundos disponíveis para coletar"
                : "Nenhum fundo disponível para coletar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-4">
                {data?.canExecute ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Pronto para coletar</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">MATIC insuficiente para gas fees</span>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              {data && data.tokens.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Valor Total das Coletas</p>
                    <p className="text-2xl font-bold text-soft">
                      ${data.totalValueUsd?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "0.00"} USD
                    </p>
                    <p className="text-xs text-zinc-500">{data.tokens.length} tokens diferentes</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400 flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      MATIC Disponível
                    </p>
                    <p className={`text-2xl font-bold ${data.canExecute ? "text-green-400" : "text-red-400"}`}>
                      {Number(data.maticBalance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Gas estimado: {Number(data.totalGasEstimate).toFixed(4)} MATIC
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tokens to Collect Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : data?.tokens && data.tokens.length > 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-soft">Tokens para Coletar</CardTitle>
            <CardDescription>
              Preview do que será transferido para a Global Wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Token</TableHead>
                  <TableHead className="text-zinc-400">Carteiras</TableHead>
                  <TableHead className="text-zinc-400">Total a Coletar</TableHead>
                  <TableHead className="text-zinc-400">Valor USD</TableHead>
                  <TableHead className="text-zinc-400">Gas Estimado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tokens.map((token) => (
                  <TableRow key={token.tokenSymbol} className="border-zinc-800 hover:bg-zinc-800/30">
                    <TableCell className="font-medium text-soft">{token.tokenSymbol}</TableCell>
                    <TableCell className="text-zinc-300">{token.walletsCount}</TableCell>
                    <TableCell className="text-zinc-300">
                      {Number(token.totalAmount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </TableCell>
                    <TableCell className="text-green-400 font-semibold">
                      ${token.valueUsd?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "0.00"}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {Number(token.gasEstimate).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}{" "}
                      MATIC
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Gas Summary */}
            <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Gas Total Estimado:</span>
                <span className="font-semibold text-soft">
                  {Number(data.totalGasEstimate).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}{" "}
                  MATIC
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  MATIC Disponível:
                </span>
                <span
                  className={`font-semibold ${
                    data.canExecute ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {Number(data.maticBalance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}{" "}
                  MATIC {data.canExecute ? "✓" : "✗"}
                </span>
              </div>
            </div>

            {/* Execute Button */}
            <div className="mt-6">
              {!data.canExecute && (
                <Alert className="mb-4 border-yellow-900/50 bg-yellow-950/50 text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Saldo de MATIC insuficiente. Recarregue a Global Wallet antes de executar a
                    coleta.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!data.canExecute}
                onClick={() => setShowConfirmDialog(true)}
              >
                <ArrowLeftRight className="h-5 w-5 mr-2" />
                Executar Coleta em Lote
              </Button>

              <p className="text-xs text-zinc-500 mt-3 text-center">
                ⚠️ Isso irá transferir todos os fundos de usuários para a Global Wallet. Ação
                irreversível.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardContent className="py-12">
            <div className="text-center text-zinc-500">
              <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum token para coletar</p>
              <p className="text-sm mt-2">
                Não há transações confirmadas aguardando transferência
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Status (while executing) */}
      {jobStatus && (jobStatus.status === "PENDING" || jobStatus.status === "IN_PROGRESS") && (
        <Card className="border-blue-800 bg-gradient-to-br from-blue-900/30 to-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-soft flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Coleta em Andamento
            </CardTitle>
            <CardDescription>Transferindo fundos para a Global Wallet...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Progresso:</span>
                <span className="text-soft font-semibold">
                  {jobStatus.progress.completed} de {jobStatus.progress.total} carteiras
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(jobStatus.progress.completed / jobStatus.progress.total) * 100}%`,
                  }}
                />
              </div>

              {jobStatus.progress.failed > 0 && (
                <div className="text-sm text-yellow-400">
                  ⚠️ {jobStatus.progress.failed} transferências falharam
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Collect History */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-soft flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Coletas
          </CardTitle>
          <CardDescription>Últimas 10 coletas em lote executadas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <Skeleton className="h-64 w-full" />
          ) : historyData?.history && historyData.history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Data/Hora</TableHead>
                  <TableHead className="text-zinc-400">Token</TableHead>
                  <TableHead className="text-zinc-400">Coletado</TableHead>
                  <TableHead className="text-zinc-400">Carteiras</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Executado por</TableHead>
                  <TableHead className="text-zinc-400">TxHashes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.history.map((item) => (
                  <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/30">
                    <TableCell className="text-zinc-300" suppressHydrationWarning>
                      {new Date(item.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-soft">{item.tokenSymbol}</TableCell>
                    <TableCell className="text-zinc-300">
                      {Number(item.totalCollected).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </TableCell>
                    <TableCell className="text-zinc-300">{item.walletsCount}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.status === "COMPLETED"
                            ? "bg-green-900/50 text-green-400"
                            : item.status === "FAILED"
                              ? "bg-red-900/50 text-red-400"
                              : "bg-yellow-900/50 text-yellow-400"
                        }`}
                      >
                        {item.status === "COMPLETED" ? "✓" : item.status === "FAILED" ? "✗" : "⚠"}{" "}
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {item.executedBy ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{item.executedBy.name}</span>
                          <span className="text-xs text-zinc-500">{item.executedBy.email}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs">
                      {item.txHashes.length} tx
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-zinc-500 py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma coleta realizada</p>
              <p className="text-sm mt-2">O histórico aparecerá aqui após a primeira execução</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="border-zinc-800 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-soft flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Confirmar Coleta em Lote
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Esta ação irá transferir todos os fundos de usuários para a Global Wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-yellow-900/50 bg-yellow-950/50 text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta ação é irreversível. Certifique-se de que deseja
                prosseguir.
              </AlertDescription>
            </Alert>

            {data && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Tokens a coletar:</span>
                  <span className="text-soft font-semibold">{data.tokens.length}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Gas estimado:</span>
                  <span className="text-soft font-semibold">
                    {Number(data.totalGasEstimate).toFixed(4)} MATIC
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleExecute}
              className="cursor-pointer gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Confirmar e Executar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
