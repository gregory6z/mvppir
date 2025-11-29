

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import {
  Brain,
  Shield,
  TrendingUp,
  Zap,
  Sparkles,
  Target,
} from "lucide-react"
import AnimationContainer from "../global/animation-container"

export const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "IA Avançada 24/7",
      description: "Inteligência artificial monitora mercados em tempo real, executando operações automaticamente no momento ideal.",
      stat: "150.000+",
      statLabel: "ativos analisados",
      gradient: "from-purple-500/20 via-magenta-500/20 to-purple-500/20",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      className: "md:col-span-2",
    },
    {
      icon: Shield,
      title: "Segurança Blockchain",
      description: "Seus fundos protegidos com criptografia militar e armazenamento em cold wallets.",
      stat: "100%",
      statLabel: "seguro",
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-400",
      borderColor: "border-green-500/30",
      className: "md:col-span-1",
    },
    {
      icon: TrendingUp,
      title: "Rendimentos Consistentes",
      description: "Acompanhe seus ganhos crescendo com taxas competitivas e transparência total.",
      stat: "24/7",
      statLabel: "operando",
      gradient: "from-cyan-500/10 to-blue-500/10",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      className: "md:col-span-1",
    },
    {
      icon: Zap,
      title: "Saques Rápidos",
      description: "Seus fundos sempre disponíveis. Saque quando quiser sem burocracia.",
      stat: "< 24h",
      statLabel: "processamento",
      gradient: "from-orange-500/10 to-yellow-500/10",
      iconColor: "text-orange-400",
      borderColor: "border-orange-500/30",
      className: "md:col-span-1",
    },
    {
      icon: Target,
      title: "Estratégia Consistente",
      description: "Algoritmos testados e otimizados para manter performance estável independente das condições de mercado.",
      stat: "99.9%",
      statLabel: "disponibilidade",
      gradient: "from-blue-500/10 to-indigo-500/10",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      className: "md:col-span-1",
    },
    {
      icon: Sparkles,
      title: "Pronto para Começar?",
      description: "Junte-se a mais de 85 mil investidores que já confiam na STAKLY para fazer seu patrimônio crescer automaticamente. Baixe o app agora e comece a investir com IA.",
      stat: "85K+",
      statLabel: "investidores ativos",
      gradient: "from-purple-500/20 via-magenta-500/20 to-cyan-400/20",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      className: "md:col-span-3",
    },
  ]

  return (
    <section id="features" className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Header */}
        <AnimationContainer delay={0.1}>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-magenta-500/10 to-cyan-400/10 border border-purple-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Tecnologia de Ponta</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-4 sm:px-0">
              Por que escolher a <span className="bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">STAKLY</span>?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Combinamos inteligência artificial avançada com segurança blockchain para oferecer a melhor experiência de investimento automatizado
            </p>
          </div>
        </AnimationContainer>

        {/* Bento Grid - Clean */}
        <AnimationContainer delay={0.2}>
          <BentoGrid className="max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const isLastCard = index === features.length - 1

              return (
                <BentoGridItem
                  key={index}
                  className={`${feature.className} relative p-5 sm:p-6 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.gradient} border ${feature.borderColor} backdrop-blur-sm`}
                  header={
                    <div className="space-y-3 sm:space-y-4">
                      {/* Icon with stat */}
                      <div className={`flex items-start ${isLastCard ? 'justify-end' : 'justify-between'}`}>
                        {!isLastCard && (
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-zinc-900/50 border ${feature.borderColor} flex items-center justify-center`}>
                            <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor}`} />
                          </div>
                        )}
                        <div className={isLastCard ? 'flex items-center gap-3 sm:gap-4' : 'text-right'}>
                          {isLastCard && (
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-zinc-900/50 border ${feature.borderColor} flex items-center justify-center`}>
                              <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor}`} />
                            </div>
                          )}
                          <div className="text-right">
                            <div className={`text-xl sm:text-2xl font-bold ${feature.iconColor}`}>
                              {feature.stat}
                            </div>
                            <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wide">
                              {feature.statLabel}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  title={
                    <h3 className={`text-lg sm:text-xl font-bold text-white ${isLastCard ? 'text-right' : ''}`}>
                      {feature.title}
                    </h3>
                  }
                  description={
                    <p className={`text-xs sm:text-sm text-zinc-400 leading-relaxed ${isLastCard ? 'text-right' : ''}`}>
                      {feature.description}
                    </p>
                  }
                />
              )
            })}
          </BentoGrid>
        </AnimationContainer>

        {/* CTA Intermediário */}
        <AnimationContainer delay={0.4}>
          <div className="text-center mt-12 sm:mt-16 md:mt-20 px-4">
            <div className="inline-flex flex-col items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  const section = document.querySelector("#hero")
                  section?.scrollIntoView({ behavior: "smooth" })
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
              >
                Baixar App Agora
              </button>
              <p className="text-xs sm:text-sm text-zinc-500">
                Disponível para iOS e Android • Grátis
              </p>
            </div>
          </div>
        </AnimationContainer>
      </div>
    </section>
  )
}
