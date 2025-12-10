import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/api/queries/admin/use-withdrawals-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, X, Clock, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/admin/withdrawals")({
  component: WithdrawalsPage,
})

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING_APPROVAL: { label: "Pendente", color: "text-yellow-400 bg-yellow-400/10", icon: <Clock className="h-4 w-4" /> },
  APPROVED: { label: "Aprovado", color: "text-blue-400 bg-blue-400/10", icon: <CheckCircle className="h-4 w-4" /> },
  PROCESSING: { label: "Processando", color: "text-purple-400 bg-purple-400/10", icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  COMPLETED: { label: "Concluído", color: "text-green-400 bg-green-400/10", icon: <CheckCircle className="h-4 w-4" /> },
  REJECTED: { label: "Rejeitado", color: "text-red-400 bg-red-400/10", icon: <XCircle className="h-4 w-4" /> },
  FAILED: { label: "Falhou", color: "text-red-400 bg-red-400/10", icon: <AlertCircle className="h-4 w-4" /> },
}

function WithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_APPROVAL")
  const [page, setPage] = useState(1)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const { data, isLoading } = useWithdrawals(statusFilter === "ALL" ? undefined : statusFilter, page)
  const approveMutation = useApproveWithdrawal()
  const rejectMutation = useRejectWithdrawal()

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
      toast.success("Saque aprovado com sucesso!")
    } catch (error) {
      toast.error("Erro ao aprovar saque")
    }
  }

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) {
      toast.error("Informe o motivo da rejeição")
      return
    }

    try {
      await rejectMutation.mutateAsync({ id: selectedWithdrawal, reason: rejectReason })
      toast.success("Saque rejeitado")
      setRejectDialogOpen(false)
      setSelectedWithdrawal(null)
      setRejectReason("")
    } catch (error) {
      toast.error("Erro ao rejeitar saque")
    }
  }

  const openRejectDialog = (id: string) => {
    setSelectedWithdrawal(id)
    setRejectDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Saques</h1>
          <p className="text-zinc-400 mt-2">Gerenciar solicitações de saque</p>
        </div>

        <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-48 bg-zinc-900 border-zinc-700 text-zinc-300">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Pendentes</SelectItem>
            <SelectItem value="APPROVED">Aprovados</SelectItem>
            <SelectItem value="PROCESSING">Processando</SelectItem>
            <SelectItem value="COMPLETED">Concluídos</SelectItem>
            <SelectItem value="REJECTED">Rejeitados</SelectItem>
            <SelectItem value="FAILED">Falhou</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">
            Solicitações de Saque
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
          ) : data?.withdrawals && data.withdrawals.length > 0 ? (
            <div className="space-y-4">
              {data.withdrawals.map((withdrawal) => {
                const status = statusLabels[withdrawal.status] || statusLabels.PENDING_APPROVAL

                return (
                  <div
                    key={withdrawal.id}
                    className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {new Date(withdrawal.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-zinc-500">Usuário</p>
                            <p className="text-sm font-medium text-white truncate">{withdrawal.user.email}</p>
                            <p className="text-xs text-zinc-500">{withdrawal.user.name}</p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Valor</p>
                            <p className="text-sm font-medium text-white">
                              {parseFloat(withdrawal.amount).toLocaleString("en-US", { maximumFractionDigits: 6 })} {withdrawal.tokenSymbol}
                            </p>
                            <p className="text-xs text-zinc-500">Taxa: {withdrawal.fee}</p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Destino</p>
                            <code className="text-xs text-zinc-400 font-mono">
                              {withdrawal.destinationAddress.slice(0, 10)}...{withdrawal.destinationAddress.slice(-6)}
                            </code>
                          </div>
                        </div>

                        {withdrawal.txHash && (
                          <div className="mt-2">
                            <p className="text-xs text-zinc-500">TX Hash</p>
                            <a
                              href={`https://polygonscan.com/tx/${withdrawal.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline font-mono"
                            >
                              {withdrawal.txHash.slice(0, 20)}...
                            </a>
                          </div>
                        )}

                        {withdrawal.admin && (
                          <div className="mt-2 p-2 bg-green-950/30 rounded border border-green-900/30">
                            <p className="text-xs text-green-400">
                              Aprovado por: {withdrawal.admin.name || withdrawal.admin.email}
                              {withdrawal.approvedAt && (
                                <span className="text-zinc-500 ml-2">
                                  em {new Date(withdrawal.approvedAt).toLocaleString("pt-BR")}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        {withdrawal.rejectedReason && (
                          <div className="mt-2 p-2 bg-red-950/30 rounded border border-red-900/30">
                            <p className="text-xs text-red-400">Motivo: {withdrawal.rejectedReason}</p>
                          </div>
                        )}
                      </div>

                      {withdrawal.status === "PENDING_APPROVAL" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Aprovar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectDialog(withdrawal.id)}
                            className="border-red-600 text-red-400 hover:bg-red-950"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
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
              <Clock className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhum saque encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Rejeitar Saque</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Informe o motivo da rejeição. O usuário será notificado.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Motivo da rejeição..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
