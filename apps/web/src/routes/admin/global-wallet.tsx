import { createFileRoute } from "@tanstack/react-router"
import { useGlobalWalletBalance } from "@/api/queries/admin/use-global-wallet-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wallet, Copy, ExternalLink, RefreshCw, DollarSign, Fuel, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/admin/global-wallet")({
  component: GlobalWalletPage,
})

function GlobalWalletPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useGlobalWalletBalance()

  const copyAddress = () => {
    if (data?.address) {
      navigator.clipboard.writeText(data.address)
      toast.success("Endereço copiado!")
    }
  }

  const openPolygonScan = () => {
    if (data?.address) {
      window.open(`https://polygonscan.com/address/${data.address}`, "_blank")
    }
  }

  // Check if MATIC balance is low (less than 1 MATIC for gas)
  const isMaticLow = data?.maticBalance ? parseFloat(data.maticBalance) < 1 : false

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Carteira Global</h1>
          <p className="text-zinc-400 mt-2">Saldos em tempo real da rede Polygon</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive" className="bg-red-950/30 border-red-900/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar saldos</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Não foi possível conectar à rede Polygon"}
          </AlertDescription>
        </Alert>
      )}

      {/* Low MATIC Warning */}
      {isMaticLow && (
        <Alert className="bg-yellow-950/30 border-yellow-700/50">
          <Fuel className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Saldo de MATIC baixo</AlertTitle>
          <AlertDescription className="text-yellow-400/80">
            O saldo de MATIC está baixo ({parseFloat(data?.maticBalance || "0").toFixed(4)} MATIC).
            Adicione mais MATIC para garantir gas suficiente para transações.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total USD Card */}
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Total em USD
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-10 bg-green-800/20 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-white">
                ${parseFloat(data?.totalUsd || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* MATIC Gas Card */}
        <Card className={`bg-gradient-to-br ${isMaticLow ? "from-yellow-900/30 to-orange-900/20 border-yellow-800/50" : "from-purple-900/30 to-indigo-900/20 border-purple-800/50"}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`flex items-center gap-2 text-sm font-medium ${isMaticLow ? "text-yellow-400" : "text-purple-400"}`}>
              <Fuel className="h-4 w-4" />
              MATIC (Gas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-10 bg-purple-800/20 rounded animate-pulse" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-white">
                  {parseFloat(data?.maticBalance || "0").toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  ≈ ${parseFloat(data?.maticUsdValue || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallet Address Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-500" />
            Endereço da Carteira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 p-3 bg-zinc-800 rounded-lg font-mono text-sm text-zinc-300 overflow-x-auto">
              {isLoading ? "Carregando..." : data?.address || "N/A"}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAddress}
              className="text-zinc-400 hover:text-white"
              disabled={!data?.address}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openPolygonScan}
              className="text-zinc-400 hover:text-white"
              disabled={!data?.address}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Saldos por Token (On-Chain)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data?.balances && data.balances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Token</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Endereço</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Saldo</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Valor USD</th>
                  </tr>
                </thead>
                <tbody>
                  {data.balances.map((token) => (
                    <tr key={token.tokenSymbol + (token.tokenAddress || "native")} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            token.tokenSymbol === "MATIC"
                              ? "bg-gradient-to-br from-purple-500 to-purple-700"
                              : token.tokenSymbol === "USDC" || token.tokenSymbol === "USDC.e"
                              ? "bg-gradient-to-br from-blue-500 to-blue-700"
                              : token.tokenSymbol === "USDT"
                              ? "bg-gradient-to-br from-green-500 to-green-700"
                              : "bg-gradient-to-br from-gray-500 to-gray-700"
                          }`}>
                            {token.tokenSymbol.slice(0, 2)}
                          </div>
                          <span className="font-medium text-white">{token.tokenSymbol}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs text-zinc-500 font-mono">
                          {token.tokenAddress
                            ? `${token.tokenAddress.slice(0, 10)}...${token.tokenAddress.slice(-6)}`
                            : "Native"}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-white">
                          {parseFloat(token.balance).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-400 font-medium">
                          ${parseFloat(token.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Nenhum saldo encontrado na blockchain</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
