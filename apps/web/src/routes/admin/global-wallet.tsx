import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useGlobalWalletBalance } from "@/api/queries/admin/use-global-wallet-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/admin/global-wallet")({
  component: GlobalWalletPage,
})

function GlobalWalletPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, refetch, isFetching } = useGlobalWalletBalance(page, 10)

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Carteira Global</h1>
          <p className="text-zinc-400 mt-2">Gerenciar saldos consolidados</p>
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
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openPolygonScan}
              className="text-zinc-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-zinc-500 mt-3">
            Total em USD:{" "}
            <span className="text-green-400 font-semibold">
              ${parseFloat(data?.totalUsd || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Saldos por Token</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
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
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.balances.map((token) => (
                    <tr key={token.tokenSymbol} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {token.tokenSymbol.slice(0, 2)}
                          </div>
                          <span className="font-medium text-white">{token.tokenSymbol}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs text-zinc-500 font-mono">
                          {token.tokenAddress ? `${token.tokenAddress.slice(0, 10)}...${token.tokenAddress.slice(-6)}` : "Native (MATIC)"}
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
                      <td className="py-4 px-4 text-right">
                        <span className="text-xs text-zinc-500">
                          {new Date(token.lastUpdated).toLocaleString("pt-BR")}
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
              <p className="text-zinc-500">Nenhum saldo encontrado</p>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
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
        </CardContent>
      </Card>
    </div>
  )
}
