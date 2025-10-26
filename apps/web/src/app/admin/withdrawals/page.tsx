"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  Fuel,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/api/queries/admin/use-withdrawals-query"
import { useGlobalWalletBalance } from "@/api/queries/admin/use-global-wallet-query"
import type { Withdrawal } from "@/api/client/admin.api"

export default function WithdrawalsPage() {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const { data: pendingData, isLoading: isPendingLoading } = useWithdrawals("PENDING_APPROVAL", 1, 50)
  const { data: historyData, isLoading: isHistoryLoading } = useWithdrawals(undefined, 1, 20)
  const { data: globalWalletData } = useGlobalWalletBalance()

  const approveMutation = useApproveWithdrawal()
  const rejectMutation = useRejectWithdrawal()

  // Calculate withdrawals stats
  const totalWithdrawn = historyData?.withdrawals
    ?.filter((w) => w.status === "COMPLETED")
    .reduce((sum, w) => sum + Number(w.amount), 0) || 0

  const totalRequested = historyData?.withdrawals
    ?.reduce((sum, w) => sum + Number(w.amount), 0) || 0

  const withdrawnPercentage = totalRequested > 0 ? (totalWithdrawn / totalRequested) * 100 : 0

  // Get MATIC balance
  const maticBalance = globalWalletData?.balances.find((b) => b.tokenSymbol === "MATIC")?.balance || "0"

  const handleApprove = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowApproveDialog(true)
  }

  const handleReject = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowRejectDialog(true)
  }

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return

    try {
      await approveMutation.mutateAsync(selectedWithdrawal.id)
      setShowApproveDialog(false)
      setSelectedWithdrawal(null)
    } catch (error) {
      console.error("Error approving withdrawal:", error)
    }
  }

  const confirmReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) return

    try {
      await rejectMutation.mutateAsync({ id: selectedWithdrawal.id, reason: rejectReason })
      setShowRejectDialog(false)
      setSelectedWithdrawal(null)
      setRejectReason("")
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
    }
  }

  const getStatusBadge = (status: Withdrawal["status"]) => {
    const styles = {
      PENDING_APPROVAL: "bg-yellow-900/50 text-yellow-400",
      APPROVED: "bg-blue-900/50 text-blue-400",
      PROCESSING: "bg-purple-900/50 text-purple-400",
      COMPLETED: "bg-green-900/50 text-green-400",
      REJECTED: "bg-red-900/50 text-red-400",
      FAILED: "bg-red-900/50 text-red-400",
    }

    return (
      <Badge className={`${styles[status]} text-xs`}>
        {status === "PENDING_APPROVAL" && <Clock className="h-3 w-3 mr-1" />}
        {status === "COMPLETED" && <CheckCircle2 className="h-3 w-3 mr-1" />}
        {(status === "REJECTED" || status === "FAILED") && <XCircle className="h-3 w-3 mr-1" />}
        {status.replace(/_/g, " ")}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Saques</h1>
          <p className="text-zinc-400">
            Gerenciar solicitações de saque e histórico
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Withdrawn Percentage Card */}
        {isHistoryLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Card className="border-zinc-800 bg-gradient-to-br from-purple-900/20 to-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Saques Realizados
              </CardTitle>
              <CardDescription>
                Percentual de saques do mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-4xl font-bold text-white">{withdrawnPercentage.toFixed(1)}%</p>
                  <p className="text-sm text-zinc-400 mt-2">
                    ${totalWithdrawn.toFixed(2)} de ${totalRequested.toFixed(2)}
                  </p>
                </div>
                <Slider
                  value={[withdrawnPercentage]}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* MATIC Balance Card */}
        <Card className="border-zinc-800 bg-gradient-to-br from-green-900/20 to-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              MATIC Disponível
            </CardTitle>
            <CardDescription>
              Saldo para gas fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-400">
              {Number(maticBalance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
            </p>
            <p className="text-sm text-zinc-500 mt-2">MATIC</p>
          </CardContent>
        </Card>

        {/* Total Balance Card */}
        <Card className="border-zinc-800 bg-gradient-to-br from-blue-900/20 to-zinc-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Saldo Total
            </CardTitle>
            <CardDescription>
              Carteira Global
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {globalWalletData?.balances.map((balance) => (
                <div key={balance.tokenSymbol} className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">{balance.tokenSymbol}</span>
                  <span className="text-lg font-semibold text-white">
                    {Number(balance.balance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-zinc-500">Nenhum saldo disponível</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Saques Pendentes de Aprovação
          </CardTitle>
          <CardDescription>
            {pendingData?.withdrawals.length || 0} saque(s) aguardando aprovação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPendingLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : pendingData?.withdrawals && pendingData.withdrawals.length > 0 ? (
            <div className="space-y-4">
              {pendingData.withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="border-zinc-800 bg-zinc-950/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{withdrawal.user.name}</p>
                            <p className="text-sm text-zinc-400">{withdrawal.user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-zinc-500">Token</p>
                            <p className="font-semibold text-white">{withdrawal.tokenSymbol}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Valor</p>
                            <p className="font-semibold text-white">
                              {Number(withdrawal.amount).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Taxa</p>
                            <p className="font-semibold text-white">
                              {Number(withdrawal.fee).toFixed(4)}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Solicitado em</p>
                            <p className="font-semibold text-white" suppressHydrationWarning>
                              {new Date(withdrawal.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500">Endereço de destino</p>
                          <p className="text-xs font-mono text-zinc-300 break-all">
                            {withdrawal.destinationAddress}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleApprove(withdrawal)}
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleReject(withdrawal)}
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum saque pendente</p>
              <p className="text-sm mt-2">Saques aparecerão aqui quando forem solicitados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawals History */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Saques
          </CardTitle>
          <CardDescription>
            Últimos 20 saques processados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : historyData?.withdrawals && historyData.withdrawals.length > 0 ? (
            <div className="space-y-3">
              {historyData.withdrawals
                .filter((w) => w.status !== "PENDING_APPROVAL")
                .map((withdrawal) => (
                  <Card key={withdrawal.id} className="border-zinc-800 bg-zinc-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <ArrowRight className="h-5 w-5 text-zinc-400" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-white">{withdrawal.user.name}</p>
                              {getStatusBadge(withdrawal.status)}
                            </div>
                            <p className="text-sm text-zinc-400">{withdrawal.user.email}</p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-white">
                              {Number(withdrawal.amount).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })} {withdrawal.tokenSymbol}
                            </p>
                            <p className="text-sm text-zinc-500" suppressHydrationWarning>
                              {new Date(withdrawal.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {withdrawal.status === "REJECTED" && withdrawal.rejectedReason && (
                        <div className="mt-3 p-3 bg-red-950/30 border border-red-900/50 rounded">
                          <p className="text-xs text-red-400">
                            <strong>Motivo da rejeição:</strong> {withdrawal.rejectedReason}
                          </p>
                        </div>
                      )}

                      {withdrawal.status === "COMPLETED" && withdrawal.txHash && (
                        <div className="mt-3 p-3 bg-green-950/30 border border-green-900/50 rounded">
                          <p className="text-xs text-green-400 font-mono break-all">
                            <strong>TxHash:</strong> {withdrawal.txHash}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum saque realizado</p>
              <p className="text-sm mt-2">O histórico aparecerá aqui após processar saques</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="border-zinc-800 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              Aprovar Saque
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Confirme a aprovação do saque. Esta ação irá processar a transferência.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-zinc-950 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Usuário:</span>
                  <span className="text-white font-medium">{selectedWithdrawal.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Token:</span>
                  <span className="text-white font-medium">{selectedWithdrawal.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Valor:</span>
                  <span className="text-white font-medium">
                    {Number(selectedWithdrawal.amount).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Taxa:</span>
                  <span className="text-white font-medium">
                    {Number(selectedWithdrawal.fee).toFixed(4)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-950/30 border border-yellow-900/50 rounded">
                <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  Ao aprovar, o saque será processado e os fundos serão enviados para o endereço de destino.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmApprove}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
              disabled={approveMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {approveMutation.isPending ? "Aprovando..." : "Confirmar Aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="border-zinc-800 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              Rejeitar Saque
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Informe o motivo da rejeição do saque.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-zinc-950 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Usuário:</span>
                  <span className="text-white font-medium">{selectedWithdrawal.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Valor:</span>
                  <span className="text-white font-medium">
                    {Number(selectedWithdrawal.amount).toFixed(4)} {selectedWithdrawal.tokenSymbol}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-white">
                  Motivo da Rejeição *
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Ex: Saldo insuficiente, endereço inválido, etc."
                  value={rejectReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectReason("")
              }}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmReject}
              variant="destructive"
              className="cursor-pointer"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {rejectMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
