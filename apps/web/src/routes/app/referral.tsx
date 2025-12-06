import { createFileRoute } from "@tanstack/react-router"
import { useReferralInfo } from "@/api/queries/user/use-user-queries"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Users, UserCheck, Share2, Gift } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/app/referral")({
  component: ReferralPage,
})

function ReferralPage() {
  const { data: referral, isLoading } = useReferralInfo()

  const copyLink = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink)
      toast.success("Link copiado!")
    }
  }

  const copyCode = () => {
    if (referral?.referralCode) {
      navigator.clipboard.writeText(referral.referralCode)
      toast.success("Código copiado!")
    }
  }

  const shareLink = async () => {
    if (referral?.referralLink && navigator.share) {
      try {
        await navigator.share({
          title: "MVPPIR - Plataforma de Investimentos",
          text: "Junte-se a mim na MVPPIR! Use meu link de indicação:",
          url: referral.referralLink,
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      copyLink()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Indicações</h1>
        <p className="text-zinc-400 mt-2">Convide amigos e ganhe comissões</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total de Indicados</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                referral?.totalReferrals || 0
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Pessoas cadastradas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Indicados Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                referral?.activeReferrals || 0
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Contas ativadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-500" />
            Seu Link de Indicação
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Compartilhe este link para convidar novos usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
          ) : (
            <>
              <div className="p-4 bg-zinc-800 rounded-lg">
                <code className="text-sm text-zinc-300 break-all font-mono">
                  {referral?.referralLink}
                </code>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={copyLink}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button
                  variant="outline"
                  onClick={shareLink}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Referral Code */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Código de Indicação</CardTitle>
          <CardDescription className="text-zinc-400">
            Seu código exclusivo para compartilhar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-16 bg-zinc-800 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 bg-zinc-800 rounded-lg text-center">
                <span className="text-2xl font-bold text-white tracking-wider">
                  {referral?.referralCode}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={copyCode}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-yellow-500" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-400">1</span>
              </div>
              <h4 className="font-medium text-white mb-1">Compartilhe</h4>
              <p className="text-sm text-zinc-500">
                Envie seu link de indicação para amigos e familiares
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-400">2</span>
              </div>
              <h4 className="font-medium text-white mb-1">Eles se cadastram</h4>
              <p className="text-sm text-zinc-500">
                Seus indicados criam uma conta e fazem o primeiro depósito
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-400">3</span>
              </div>
              <h4 className="font-medium text-white mb-1">Você ganha</h4>
              <p className="text-sm text-zinc-500">
                Receba comissões sobre as atividades dos seus indicados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Info */}
      <Card className="bg-gradient-to-br from-purple-950/50 to-blue-950/50 border-purple-800/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Gift className="h-8 w-8 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-white text-lg">Sistema de Comissões Multinível</h3>
              <p className="text-zinc-400 mt-2">
                Ganhe comissões não apenas dos seus indicados diretos, mas também dos indicados deles!
                Quanto mais sua rede cresce, mais você ganha.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-xl font-bold text-green-400">10%</p>
                  <p className="text-xs text-zinc-500">Nível 1</p>
                </div>
                <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-xl font-bold text-blue-400">5%</p>
                  <p className="text-xs text-zinc-500">Nível 2</p>
                </div>
                <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-xl font-bold text-purple-400">2%</p>
                  <p className="text-xs text-zinc-500">Nível 3</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
