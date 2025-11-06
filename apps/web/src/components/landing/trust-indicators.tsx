import { Shield, Smartphone } from "lucide-react"
import { Card } from "@/components/ui/card"

export const TrustIndicators = () => {
  const stats = [
    {
      value: "R$ 10M+",
      label: "Em transações processadas",
    },
    {
      value: "5.000+",
      label: "Investidores ativos",
    },
    {
      value: "15%",
      label: "Crescimento médio mensal",
    },
  ]

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container px-4 mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-zinc-900/50 border-zinc-800 p-8 text-center hover:border-[--color-stakly-blue] transition-colors"
            >
              <div className="text-4xl font-bold text-gradient-blue mb-2">
                {stat.value}
              </div>
              <div className="text-zinc-400">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-zinc-400">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[--color-stakly-green]" />
            <span>Criptografia de ponta a ponta</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[--color-stakly-blue]" />
            <span>Disponível para iOS & Android</span>
          </div>
        </div>
      </div>
    </section>
  )
}
