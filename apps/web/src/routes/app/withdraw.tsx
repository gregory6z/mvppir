import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import {
  useBalance,
  useWithdrawalLimits,
  useCalculateWithdrawalFee,
  useRequestWithdrawal,
} from "@/api/queries/user/use-user-queries"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowUpFromLine,
  AlertCircle,
  Loader2,
  CheckCircle,
  Info,
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/app/withdraw")({
  component: WithdrawPage,
})

function WithdrawPage() {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [destinationAddress, setDestinationAddress] = useState("")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const { data: balance, isLoading: balanceLoading } = useBalance()
  const { data: limits, isLoading: limitsLoading } = useWithdrawalLimits()
  const { data: feeData, isLoading: feeLoading } = useCalculateWithdrawalFee(
    amount,
    selectedToken,
    !!selectedToken && parseFloat(amount) > 0
  )
  const withdrawMutation = useRequestWithdrawal()

  // Auto-select first token with balance
  useEffect(() => {
    if (balance?.balances && balance.balances.length > 0 && !selectedToken) {
      const firstWithBalance = balance.balances.find(
        (b) => parseFloat(b.availableBalance) > 0
      )
      if (firstWithBalance) {
        setSelectedToken(firstWithBalance.tokenSymbol)
      }
    }
  }, [balance, selectedToken])

  const selectedBalance = balance?.balances.find((b) => b.tokenSymbol === selectedToken)
  const availableBalance = parseFloat(selectedBalance?.availableBalance || "0")

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString())
  }

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const canSubmit =
    selectedToken &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= availableBalance &&
    isValidAddress(destinationAddress) &&
    limits?.canWithdraw &&
    !withdrawMutation.isPending

  const handleSubmit = () => {
    if (!canSubmit) return
    setConfirmDialogOpen(true)
  }

  const handleConfirmWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync({
        amount,
        tokenSymbol: selectedToken,
        destinationAddress,
      })
      toast.success("Saque solicitado com sucesso!")
      setConfirmDialogOpen(false)
      setAmount("")
      setDestinationAddress("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao solicitar saque")
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Sacar</h1>
        <p className="text-zinc-400 mt-2">Solicite a transferência de seus fundos</p>
      </div>

      {/* Limits Warning */}
      {limits && !limits.canWithdraw && (
        <Card className="bg-red-950/30 border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-400">Saque não disponível</h3>
                <p className="text-sm text-zinc-400 mt-1">{limits.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowUpFromLine className="h-5 w-5 text-purple-500" />
                Solicitar Saque
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Preencha os dados para solicitar um saque
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Selection */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione o token" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {balance?.balances
                      .filter((b) => parseFloat(b.availableBalance) > 0)
                      .map((token) => (
                        <SelectItem key={token.tokenSymbol} value={token.tokenSymbol}>
                          <div className="flex items-center gap-2">
                            <span>{token.tokenSymbol}</span>
                            <span className="text-zinc-500">
                              ({parseFloat(token.availableBalance).toLocaleString("en-US", { maximumFractionDigits: 6 })} disponível)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Quantidade</Label>
                  {selectedBalance && (
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      MAX: {parseFloat(selectedBalance.availableBalance).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                {parseFloat(amount) > availableBalance && (
                  <p className="text-xs text-red-400">Saldo insuficiente</p>
                )}
              </div>

              {/* Destination Address */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Endereço de Destino (Polygon)</Label>
                <Input
                  placeholder="0x..."
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white font-mono"
                />
                {destinationAddress && !isValidAddress(destinationAddress) && (
                  <p className="text-xs text-red-400">Endereço inválido</p>
                )}
              </div>

              {/* Fee Preview */}
              {feeData && (
                <div className="p-4 bg-zinc-800/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Quantidade</span>
                    <span className="text-white">{feeData.amount} {feeData.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Taxa ({feeData.feePercentage}%)</span>
                    <span className="text-yellow-400">-{feeData.fee} {feeData.tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-zinc-700">
                    <span className="text-zinc-300 font-medium">Valor Líquido</span>
                    <span className="text-green-400 font-medium">{feeData.netAmount} {feeData.tokenSymbol}</span>
                  </div>
                </div>
              )}

              {feeLoading && parseFloat(amount) > 0 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                )}
                Solicitar Saque
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          {/* Limits Info */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Limites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {limitsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 bg-zinc-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : limits ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Mínimo</span>
                    <span className="text-white">${limits.minAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Máximo</span>
                    <span className="text-white">${limits.maxAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Limite diário</span>
                    <span className="text-white">${limits.dailyLimit}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                    <span className="text-zinc-400">Usado hoje</span>
                    <span className="text-yellow-400">${limits.dailyUsed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Disponível</span>
                    <span className="text-green-400">${limits.dailyRemaining}</span>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-blue-950/30 border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="text-sm text-zinc-400 space-y-2">
                  <p>Saques são processados em até 24 horas úteis após aprovação.</p>
                  <p>O saque será enviado para a rede Polygon (MATIC).</p>
                  <p>Taxa de rede (gas) é cobrada separadamente.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Saque</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Revise os detalhes do saque antes de confirmar
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Token</span>
              <span className="text-white font-medium">{selectedToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Quantidade</span>
              <span className="text-white font-medium">{amount}</span>
            </div>
            {feeData && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Taxa</span>
                  <span className="text-yellow-400">-{feeData.fee}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                  <span className="text-zinc-300 font-medium">Valor Líquido</span>
                  <span className="text-green-400 font-medium">{feeData.netAmount}</span>
                </div>
              </>
            )}
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-zinc-400 text-sm">Endereço de destino</span>
              <code className="block text-xs text-zinc-300 font-mono mt-1 break-all">
                {destinationAddress}
              </code>
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
              onClick={handleConfirmWithdraw}
              disabled={withdrawMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {withdrawMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirmar Saque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
