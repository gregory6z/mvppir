import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Wallet,
  Users,
  TrendingUp,
  ArrowUpRight,
  Fuel,
  Shield
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-zinc-400">
          Aqui está o que está acontecendo com sua plataforma hoje.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-zinc-400 mt-1">Usuários ativos</p>
          </CardContent>
        </Card>

        {/* Global Wallet */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Carteira Global</CardTitle>
            <Wallet className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$0.00</div>
            <p className="text-xs text-zinc-400 mt-1">Saldo total</p>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Saques Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-zinc-400 mt-1">Aguardando aprovação</p>
          </CardContent>
        </Card>

        {/* MATIC Balance */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Saldo MATIC</CardTitle>
            <Fuel className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-zinc-400 mt-1">Gas disponível</p>
          </CardContent>
        </Card>

        {/* Deposits 24h */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Depósitos (24h)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$0.00</div>
            <p className="text-xs text-zinc-400 mt-1">0 transações</p>
          </CardContent>
        </Card>

        {/* Admin Users */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4</div>
            <p className="text-xs text-green-400 mt-1">Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur hover:border-purple-500/50 transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                Gerenciar Saques
              </CardTitle>
              <CardDescription className="text-xs">
                Aprovar ou rejeitar solicitações pendentes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur hover:border-purple-500/50 transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                Coleta em Lote
              </CardTitle>
              <CardDescription className="text-xs">
                Transferir fundos para carteira global
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur hover:border-purple-500/50 transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                Monitorar MATIC
              </CardTitle>
              <CardDescription className="text-xs">
                Verificar status do saldo de gas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur hover:border-purple-500/50 transition-all duration-200 cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                Ver Usuários
              </CardTitle>
              <CardDescription className="text-xs">
                Gerenciar contas de usuários
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Status do Sistema</CardTitle>
          <CardDescription>Todos os sistemas operacionais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Servidor API</span>
            <span className="flex items-center gap-2 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Banco de Dados</span>
            <span className="flex items-center gap-2 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              Conectado
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Fila Redis</span>
            <span className="flex items-center gap-2 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              Executando
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Workers</span>
            <span className="flex items-center gap-2 text-sm text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              Ativos
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
