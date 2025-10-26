"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  AlertTriangle,
  Wallet,
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
                    ${totalWithdrawn.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} de ${totalRequested.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
                    style={{ width: `${withdrawnPercentage}%` }}
                  />
                </div>
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
              <Wallet className="h-5 w-5" />
              Saldo Total
            </CardTitle>
            <CardDescription>
              Carteira Global (USD)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-400">
              ${Number(globalWalletData?.totalUsd || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              {globalWalletData?.balances.length || 0} tokens diferentes
            </p>
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
            <Skeleton className="h-64 w-full" />
          ) : pendingData?.withdrawals && pendingData.withdrawals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Usuário</TableHead>
                  <TableHead className="text-zinc-400">Token</TableHead>
                  <TableHead className="text-zinc-400">Valor</TableHead>
                  <TableHead className="text-zinc-400">Taxa</TableHead>
                  <TableHead className="text-zinc-400">Endereço de Destino</TableHead>
                  <TableHead className="text-zinc-400">Solicitado em</TableHead>
                  <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingData.withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id} className="border-zinc-800 hover:bg-zinc-800/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{withdrawal.user.name}</p>
                        <p className="text-xs text-zinc-500">{withdrawal.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white">{withdrawal.tokenSymbol}</TableCell>
                    <TableCell className="text-zinc-300">
                      {Number(withdrawal.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {Number(withdrawal.fee).toFixed(4)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {withdrawal.destinationAddress.slice(0, 10)}...{withdrawal.destinationAddress.slice(-8)}
                    </TableCell>
                    <TableCell className="text-zinc-300" suppressHydrationWarning>
                      {new Date(withdrawal.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleApprove(withdrawal)}
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleReject(withdrawal)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Skeleton className="h-64 w-full" />
          ) : historyData?.withdrawals && historyData.withdrawals.filter((w) => w.status !== "PENDING_APPROVAL").length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Usuário</TableHead>
                  <TableHead className="text-zinc-400">Token</TableHead>
                  <TableHead className="text-zinc-400">Valor</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Autorizado por</TableHead>
                  <TableHead className="text-zinc-400">Data</TableHead>
                  <TableHead className="text-zinc-400">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.withdrawals
                  .filter((w) => w.status !== "PENDING_APPROVAL")
                  .map((withdrawal) => (
                    <TableRow key={withdrawal.id} className="border-zinc-800 hover:bg-zinc-800/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{withdrawal.user.name}</p>
                          <p className="text-xs text-zinc-500">{withdrawal.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">{withdrawal.tokenSymbol}</TableCell>
                      <TableCell className="text-zinc-300">
                        {Number(withdrawal.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell>
                        {withdrawal.admin ? (
                          <div>
                            <p className="font-medium text-white text-sm">{withdrawal.admin.name}</p>
                            <p className="text-xs text-zinc-500">{withdrawal.admin.email}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-600 italic">Sistema</p>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-300" suppressHydrationWarning>
                        {new Date(withdrawal.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === "REJECTED" && withdrawal.rejectedReason && (
                          <p className="text-xs text-red-400 max-w-xs truncate" title={withdrawal.rejectedReason}>
                            {withdrawal.rejectedReason}
                          </p>
                        )}
                        {withdrawal.status === "COMPLETED" && withdrawal.txHash && (
                          <p className="text-xs text-green-400 font-mono max-w-xs truncate" title={withdrawal.txHash}>
                            {withdrawal.txHash.slice(0, 10)}...{withdrawal.txHash.slice(-8)}
                          </p>
                        )}
                        {withdrawal.status === "FAILED" && (
                          <p className="text-xs text-red-400">Falha no processamento</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
