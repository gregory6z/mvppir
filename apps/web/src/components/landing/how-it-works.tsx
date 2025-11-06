"use client"

import { CheckCircle2, TrendingUp, Shield, Zap, LineChart, Lock } from "lucide-react"
import AnimationContainer from "../global/animation-container"

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Crie sua conta em minutos",
      description: "Cadastro rápido e verificação automática. Não é necessário enviar documentos complexos ou passar por processos burocráticos. Basta seu email e alguns dados básicos para começar.",
      details: [
        "Verificação em até 5 minutos",
        "Sem taxa de abertura de conta",
        "Processo 100% digital",
      ],
      icon: CheckCircle2,
      color: "cyan",
    },
    {
      number: "02",
      title: "Deposite seus fundos com segurança",
      description: "Faça seu primeiro depósito usando PIX, transferência bancária ou criptomoedas. Seus fundos ficam em carteiras blockchain com múltiplas camadas de segurança e criptografia militar.",
      details: [
        "Depósito mínimo de apenas € 100",
        "Fundos disponíveis instantaneamente",
        "Carteiras cold storage protegidas",
      ],
      icon: Shield,
      color: "purple",
    },
    {
      number: "03",
      title: "IA trabalha 24/7 para você",
      description: "Nossa inteligência artificial monitora milhares de oportunidades por segundo em múltiplos mercados. O sistema identifica padrões, analisa tendências e executa operações automaticamente no momento ideal.",
      details: [
        "Análise de 50.000+ ativos em tempo real",
        "Decisões baseadas em machine learning",
        "Rebalanceamento automático de portfólio",
      ],
      icon: Zap,
      color: "magenta",
    },
    {
      number: "04",
      title: "Acompanhe seus ganhos em tempo real",
      description: "Monitore o crescimento do seu patrimônio através do app ou dashboard web. Visualize gráficos detalhados, histórico de operações e relatórios de performance. Receba notificações de ganhos significativos.",
      details: [
        "Dashboard atualizado em tempo real",
        "Relatórios semanais e mensais",
        "Transparência total de operações",
      ],
      icon: LineChart,
      color: "cyan",
    },
    {
      number: "05",
      title: "Saque quando quiser",
      description: "Seus fundos estão sempre disponíveis. Faça saques parciais ou totais a qualquer momento sem taxas abusivas ou períodos de carência. O dinheiro cai na sua conta em até 24 horas.",
      details: [
        "Saques ilimitados sem bloqueio",
        "Processamento em até 24h",
        "Taxas competitivas e transparentes",
      ],
      icon: TrendingUp,
      color: "purple",
    },
  ]

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Aurora background effect - very subtle */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full"
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-400/5 blur-[120px] rounded-full"
        />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 mx-auto max-w-6xl">
        {/* Header */}
        <AnimationContainer delay={0.1}>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Processo Simples e Seguro</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-4 sm:px-0">
              Comece a Investir em <span className="bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">5 Passos</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Do cadastro aos ganhos - tudo automatizado e simples. Veja como é fácil começar a fazer seu dinheiro crescer
            </p>
          </div>
        </AnimationContainer>

        {/* Steps */}
        <div className="space-y-6 md:space-y-8 lg:space-y-12">
          {steps.map((step, index) => (
            <AnimationContainer key={index} delay={0.1 + index * 0.1}>
              <div className="relative group">
                {/* Connector line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-[52px] top-[120px] w-0.5 h-[calc(100%+3rem)] bg-gradient-to-b from-zinc-800 via-zinc-800/50 to-transparent" />
                )}

                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 p-5 sm:p-6 md:p-8 rounded-xl md:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 backdrop-blur-sm">
                  {/* Left side - Number & Icon */}
                  <div className="flex md:flex-col items-center md:items-start gap-3 sm:gap-4 md:gap-6 shrink-0">
                    {/* Large number */}
                    <div className="relative w-20 sm:w-24 md:w-28 h-16 sm:h-18 md:h-20 flex items-center">
                      <span className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-br from-zinc-800 to-zinc-900 bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>
                    {/* Icon below number */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-${step.color}-500/10 border border-${step.color}-500/20 flex items-center justify-center`}>
                      <step.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${step.color}-400`} />
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex-1 space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-4">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          {/* Elegant check icon with gradient background */}
                          <div className="relative shrink-0 mt-0.5 group/check">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 blur-md rounded-full opacity-50 group-hover/check:opacity-75 transition-opacity" />
                            {/* Icon container */}
                            <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40 flex items-center justify-center backdrop-blur-sm">
                              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" strokeWidth={2.5} />
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimationContainer>
          ))}
        </div>

        {/* Bottom CTA */}
        <AnimationContainer delay={0.7}>
          <div className="relative mt-12 sm:mt-16 md:mt-20 p-6 sm:p-8 md:p-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500/10 via-magenta-500/10 to-cyan-400/10 border border-purple-500/20 overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 blur-[100px] rounded-full" />

            <div className="relative z-10 text-center space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white px-4 sm:px-0">
                Pronto para começar a investir com IA?
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                Junte-se a mais de <span className="text-cyan-400 font-semibold">85.000 investidores</span> que já confiam na STAKLY para fazer seu patrimônio crescer automaticamente
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4 sm:px-0">
                <button
                  onClick={() => {
                    const section = document.querySelector("#hero")
                    section?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
                >
                  Começar Agora
                </button>
              </div>
            </div>
          </div>
        </AnimationContainer>
      </div>
    </section>
  )
}
