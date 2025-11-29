"use client"

import { useGlobalWalletBalance } from "@/api/queries/admin/use-global-wallet-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Copy, RefreshCw, Wallet, TrendingUp, Fuel } from "lucide-react"
import { useState } from "react"

export default function GlobalWalletPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const { data, isLoading, error, refetch, isFetching } = useGlobalWalletBalance(page, limit)
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (data?.address) {
      await navigator.clipboard.writeText(data.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-soft mb-2">Carteira Global</h1>
          <p className="text-zinc-400">
            Visualize os saldos de todos os tokens na carteira global.
          </p>
        </div>

        <Alert variant="destructive" className="border-red-800 bg-red-900/50">
          <AlertDescription>
            Erro ao carregar saldos da carteira global. Tente novamente.
          </AlertDescription>
        </Alert>

        <Button onClick={handleRefresh} variant="outline" className="w-fit cursor-pointer hover:bg-zinc-800 transition-colors">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft mb-2">Carteira Global</h1>
          <p className="text-zinc-400">
            Visualize os saldos de todos os tokens na carteira global.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50">
              <Wallet className="h-3.5 w-3.5 text-zinc-500" />
              <code className="text-xs text-zinc-400 font-mono">
                {data?.address && `${data.address.slice(0, 6)}...${data.address.slice(-4)}`}
              </code>
            </div>
          )}

          <Button
            onClick={handleCopyAddress}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copiado!" : "Copiar"}
          </Button>

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
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Balance USD */}
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Card className="border-zinc-800 bg-gradient-to-br from-purple-900/20 to-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-soft flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Valor Total
              </CardTitle>
              <CardDescription>Soma de todos os tokens em USD</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-soft">
                ${Number(data?.totalUsd || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* MATIC Balance */}
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Card className="border-zinc-800 bg-gradient-to-br from-blue-900/20 to-zinc-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-soft flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Saldo MATIC
              </CardTitle>
              <CardDescription>Token nativo para taxas de gas</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.balances && (() => {
                const maticBalance = data.balances.find(b => b.tokenSymbol === "MATIC")
                return maticBalance ? (
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-soft">
                      {Number(maticBalance.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </div>
                    <div className="text-sm text-zinc-400">
                      ${Number(maticBalance.usdValue).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} USD
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl font-semibold text-zinc-500">
                    0.00 MATIC
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Token Balances Table */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-soft">Saldos por Token</CardTitle>
          <CardDescription>Todos os tokens na carteira global</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.balances && data.balances.length > 0 ? (
            <div className="rounded-md border border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableHead className="text-zinc-400">Token</TableHead>
                    <TableHead className="text-zinc-400">Endereço</TableHead>
                    <TableHead className="text-right text-zinc-400">Saldo</TableHead>
                    <TableHead className="text-right text-zinc-400">Valor USD</TableHead>
                    <TableHead className="text-right text-zinc-400">Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.balances.map((balance) => (
                    <TableRow
                      key={balance.tokenSymbol}
                      className="border-zinc-800 hover:bg-zinc-900/50"
                    >
                      <TableCell className="font-semibold text-soft">
                        {balance.tokenSymbol}
                      </TableCell>
                      <TableCell>
                        {balance.tokenAddress ? (
                          <code className="text-xs text-zinc-500 font-mono">
                            {balance.tokenAddress.slice(0, 6)}...
                            {balance.tokenAddress.slice(-4)}
                          </code>
                        ) : (
                          <span className="text-xs text-zinc-600">Native</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-soft">
                        {Number(balance.balance).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-400">
                        $
                        {Number(balance.usdValue).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-500">
                        {new Date(balance.lastUpdated).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Nenhum token encontrado na carteira global</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                p === 1 ||
                p === data.pagination.totalPages ||
                (p >= page - 1 && p <= page + 1)

              if (!showPage) {
                // Show ellipsis for gaps
                if (p === 2 || p === data.pagination.totalPages - 1) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              }

              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => setPage(p)}
                    isActive={page === p}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                className={
                  page === data.pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
