import { createFileRoute } from "@tanstack/react-router"
import { useDepositAddress, useBalance } from "@/api/queries/user/use-user-queries"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, QrCode, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/app/deposit")({
  component: DepositPage,
})

function DepositPage() {
  const { data: depositAddress, isLoading, error } = useDepositAddress()
  const { data: balance } = useBalance()

  const copyAddress = () => {
    if (depositAddress?.address) {
      navigator.clipboard.writeText(depositAddress.address)
      toast.success("Endereço copiado!")
    }
  }

  const openPolygonScan = () => {
    if (depositAddress?.address) {
      window.open(`https://polygonscan.com/address/${depositAddress.address}`, "_blank")
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Depositar</h1>
        <p className="text-zinc-400 mt-2">Envie tokens para seu endereço de depósito</p>
      </div>

      {/* Important Notice */}
      <Card className="bg-blue-950/30 border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-400">Importante</h3>
              <ul className="text-sm text-zinc-400 mt-2 space-y-1">
                <li>• Envie apenas tokens na rede <strong className="text-white">Polygon (MATIC)</strong></li>
                <li>• Aceitamos: USDC, USDT, MATIC e outros tokens ERC-20</li>
                <li>• Depósitos são creditados após confirmação na blockchain</li>
                <li>• Depósito mínimo para ativação: $100 USD</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code and Address */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-500" />
              QR Code
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Escaneie para depositar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isLoading ? (
              <div className="w-48 h-48 bg-zinc-800 rounded-lg animate-pulse" />
            ) : depositAddress?.qrCode ? (
              <div className="p-4 bg-white rounded-lg">
                <img
                  src={depositAddress.qrCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-zinc-500 text-sm">Erro ao gerar QR</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Endereço de Depósito</CardTitle>
            <CardDescription className="text-zinc-400">
              Rede: Polygon (MATIC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
            ) : error ? (
              <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">Erro ao carregar endereço</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-zinc-800 rounded-lg">
                  <code className="text-sm text-zinc-300 break-all font-mono">
                    {depositAddress?.address}
                  </code>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={copyAddress}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Endereço
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openPolygonScan}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-zinc-400">
                    Seu endereço exclusivo e permanente
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Balances */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Seus Saldos Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          {balance?.balances && balance.balances.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {balance.balances.map((token) => (
                <div
                  key={token.tokenSymbol}
                  className="p-4 bg-zinc-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {token.tokenSymbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{token.tokenSymbol}</p>
                      <p className="text-sm text-green-400">
                        ${parseFloat(token.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-lg font-medium text-white">
                    {parseFloat(token.totalBalance).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500">Nenhum saldo ainda</p>
              <p className="text-sm text-zinc-600 mt-1">
                Faça seu primeiro depósito para começar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported Tokens */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Tokens Suportados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { symbol: "USDC", name: "USD Coin", color: "from-blue-500 to-blue-600" },
              { symbol: "USDT", name: "Tether", color: "from-green-500 to-green-600" },
              { symbol: "MATIC", name: "Polygon", color: "from-purple-500 to-purple-600" },
              { symbol: "ETH", name: "Ethereum", color: "from-gray-400 to-gray-500" },
            ].map((token) => (
              <div
                key={token.symbol}
                className="p-4 bg-zinc-800/30 rounded-lg flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-white">{token.symbol}</p>
                  <p className="text-xs text-zinc-500">{token.name}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500 mt-4">
            * Outros tokens ERC-20 na rede Polygon também são aceitos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
