"use client"

import { TrendingUp, Shield, Zap, DollarSign, BarChart3, Wallet } from "lucide-react"
import AnimationContainer from "../global/animation-container"
import { BorderBeam } from "../ui/border-beam"

export const PhoneShowcase = () => {
  // Floating icons with their positions
  const floatingIcons = [
    { Icon: TrendingUp, color: "text-[--color-stakly-green]", position: "top-0 left-0", delay: 0 },
    { Icon: Shield, color: "text-purple-500", position: "top-10 right-0", delay: 0.2 },
    { Icon: Zap, color: "text-[--color-stakly-amber]", position: "bottom-20 left-0", delay: 0.4 },
    { Icon: DollarSign, color: "text-[--color-stakly-blue]", position: "bottom-0 right-0", delay: 0.6 },
  ]

  const floatingIconsRight = [
    { Icon: BarChart3, color: "text-[--color-stakly-blue]", position: "top-0 right-0", delay: 0.1 },
    { Icon: Wallet, color: "text-[--color-stakly-green]", position: "top-20 left-0", delay: 0.3 },
    { Icon: Shield, color: "text-purple-500", position: "bottom-10 right-0", delay: 0.5 },
    { Icon: TrendingUp, color: "text-[--color-stakly-amber]", position: "bottom-0 left-0", delay: 0.7 },
  ]

  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

      <div className="container relative z-10 px-4 mx-auto">
        <AnimationContainer delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Interface{" "}
              <span className="text-gradient-blue">Intuitiva</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Acompanhe seus investimentos em tempo real com nossa plataforma moderna
            </p>
          </div>
        </AnimationContainer>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Phone 1 - Portfolio */}
          <AnimationContainer delay={0.2} className="relative">
            <div className="relative w-full max-w-xs mx-auto">
              {/* Floating Icons */}
              {floatingIcons.map(({ Icon, color, position, delay }, index) => (
                <AnimationContainer
                  key={index}
                  delay={delay + 0.3}
                  className={`absolute ${position} z-20`}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl rounded-full" />
                    <div className="relative p-3 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-sm">
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                  </div>
                </AnimationContainer>
              ))}

              {/* Phone mockup */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-[--color-stakly-blue] to-purple-500 rounded-[3.25rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity" />

                <div className="relative aspect-[9/19] bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-[3rem] border border-zinc-800/50 shadow-2xl p-3 overflow-hidden">
                  {/* Border Beam */}
                  <BorderBeam size={300} duration={12} delay={0} borderWidth={1.5} colorFrom="#a855f7" colorTo="#00a3ff" />

                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-2xl z-10" />

                  {/* Screen */}
                  <div className="relative w-full h-full bg-gradient-to-b from-zinc-950 to-black rounded-[2.5rem] border border-zinc-800/50 overflow-hidden">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-400">Portfolio</div>
                        <div className="h-8 w-8 bg-zinc-800/50 rounded-full" />
                      </div>

                      {/* Balance */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-transparent border border-purple-500/20">
                        <div className="text-xs text-zinc-500 mb-2">Valor Total</div>
                        <div className="text-3xl font-bold text-white mb-2">R$ 89.450</div>
                        <div className="text-sm text-[--color-stakly-green]">+22.5% este mês</div>
                      </div>

                      {/* Assets */}
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[--color-stakly-blue]/20 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-[--color-stakly-blue]" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-white">Bitcoin</div>
                            <div className="text-xs text-zinc-500">0.045 BTC</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white">R$ 12.340</div>
                            <div className="text-xs text-[--color-stakly-green]">+5.2%</div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-white">Ethereum</div>
                            <div className="text-xs text-zinc-500">2.5 ETH</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white">R$ 24.890</div>
                            <div className="text-xs text-[--color-stakly-green]">+8.1%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimationContainer>

          {/* Phone 2 - AI Analysis */}
          <AnimationContainer delay={0.4} className="relative">
            <div className="relative w-full max-w-xs mx-auto">
              {/* Floating Icons */}
              {floatingIconsRight.map(({ Icon, color, position, delay }, index) => (
                <AnimationContainer
                  key={index}
                  delay={delay + 0.3}
                  className={`absolute ${position} z-20`}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full" />
                    <div className="relative p-3 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-sm">
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                  </div>
                </AnimationContainer>
              ))}

              {/* Phone mockup */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[--color-stakly-blue] via-purple-500 to-[--color-stakly-blue] rounded-[3.25rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity" />

                <div className="relative aspect-[9/19] bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-[3rem] border border-zinc-800/50 shadow-2xl p-3 overflow-hidden">
                  {/* Border Beam */}
                  <BorderBeam size={300} duration={12} delay={6} borderWidth={1.5} colorFrom="#00a3ff" colorTo="#a855f7" />

                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-2xl z-10" />

                  {/* Screen */}
                  <div className="relative w-full h-full bg-gradient-to-b from-zinc-950 to-black rounded-[2.5rem] border border-zinc-800/50 overflow-hidden">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-400">Análise IA</div>
                        <div className="h-8 w-8 bg-zinc-800/50 rounded-full" />
                      </div>

                      {/* AI Card */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-[--color-stakly-blue]/20 via-purple-500/10 to-transparent border border-[--color-stakly-blue]/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="h-4 w-4 text-[--color-stakly-amber]" />
                          <div className="text-xs text-zinc-400">Recomendação IA</div>
                        </div>
                        <div className="text-sm text-white mb-3">
                          Momento ideal para investir em BTC baseado em análise preditiva
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-gradient-to-r from-[--color-stakly-blue] to-purple-500 rounded-full" />
                          </div>
                          <span className="text-xs text-zinc-400">85%</span>
                        </div>
                      </div>

                      {/* Predictions */}
                      <div className="space-y-2">
                        <div className="text-xs text-zinc-500 font-medium">Previsões 24h</div>

                        <div className="p-3 rounded-lg bg-zinc-900/50 border border-[--color-stakly-green]/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-white">BTC/USD</div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-[--color-stakly-green]" />
                              <span className="text-xs text-[--color-stakly-green]">Alta</span>
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500">Confiança: 87%</div>
                        </div>

                        <div className="p-3 rounded-lg bg-zinc-900/50 border border-purple-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-white">ETH/USD</div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-purple-500" />
                              <span className="text-xs text-purple-500">Alta</span>
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500">Confiança: 92%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimationContainer>
        </div>
      </div>
    </section>
  )
}
