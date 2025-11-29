import { TrendingUp, Target, Brain, Clock } from "lucide-react"
import AnimationContainer from "../global/animation-container"

export const AITechnology = () => {
  const technologies = [
    {
      icon: TrendingUp,
      title: "Análise Preditiva em Tempo Real",
      description: "Monitora continuamente os mercados financeiros, processando dados históricos e identificando padrões que indicam tendências futuras.",
      stat: "1000+",
      statLabel: "variáveis analisadas",
      gradient: "from-purple-500/10 via-purple-500/20 to-purple-500/10",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30",
    },
    {
      icon: Clock,
      title: "Timing Perfeito de Entrada e Saída",
      description: "Calcula o momento ideal para cada operação, identificando janelas de oportunidade e analisando risco/retorno automaticamente.",
      stat: "<100ms",
      statLabel: "tempo de resposta",
      gradient: "from-cyan-500/10 via-cyan-500/20 to-cyan-500/10",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
    },
    {
      icon: Target,
      title: "Gestão Automatizada de Portfólio",
      description: "Rebalanceia automaticamente sua carteira, diversifica investimentos e ajusta estratégias conforme as condições do mercado mudam.",
      stat: "24/7",
      statLabel: "monitoramento contínuo",
      gradient: "from-indigo-500/10 via-indigo-500/20 to-indigo-500/10",
      iconColor: "text-indigo-400",
      borderColor: "border-indigo-500/30",
    },
  ]

  return (
    <section id="ai-technology" className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="container px-4 mx-auto relative z-10 max-w-6xl">
        {/* Header */}
        <AnimationContainer delay={0.1}>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-zinc-400">Tecnologia Avançada</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-4 sm:px-0">
              A <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">IA que Investe</span> por Você
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
              Enquanto você dorme, trabalha ou aproveita a vida, nossa inteligência artificial analisa milhares de oportunidades e executa as melhores operações automaticamente
            </p>
          </div>
        </AnimationContainer>

        {/* Explanatory Text Block */}
        <AnimationContainer delay={0.15}>
          <div className="max-w-5xl mx-auto mb-12 sm:mb-16 md:mb-20">
            <div className="relative p-6 sm:p-8 md:p-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 blur-[100px] rounded-full" />

              <div className="relative z-10 space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                    Como Funciona Nossa Inteligência Artificial
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 leading-relaxed">
                    Nossa plataforma utiliza algoritmos de <span className="text-purple-400 font-semibold">machine learning</span> e <span className="text-cyan-400 font-semibold">deep learning</span> que foram treinados com milhões de pontos de dados históricos dos mercados financeiros. O sistema opera em múltiplas camadas de processamento, cada uma especializada em diferentes aspectos da análise de mercado.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      Coleta e Processamento de Dados
                    </h4>
                    <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed">
                      A IA monitora continuamente feeds de dados em tempo real de múltiplas exchanges, agregadores de preços, redes sociais e fontes de notícias financeiras. Cada segundo, processamos mais de 50.000 ativos, analisando padrões de preço, volumes de negociação, profundidade de orderbook, e sentimento de mercado através de processamento de linguagem natural.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      Análise Preditiva Multi-Dimensional
                    </h4>
                    <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed">
                      Utilizamos redes neurais recorrentes (RNN) e transformers para identificar padrões complexos que indicam movimentos futuros de preço. O modelo considera correlações entre diferentes ativos, ciclos de mercado, eventos macroeconômicos, e até mesmo padrões comportamentais de traders para prever tendências com alta precisão.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      Otimização de Portfólio Dinâmica
                    </h4>
                    <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed">
                      Nossa IA aplica teoria moderna de portfólio combinada com algoritmos de reforço (reinforcement learning) para balancear risco e retorno automaticamente. O sistema ajusta alocações em tempo real com base em volatilidade de mercado, correlações entre ativos, e seu perfil de risco individual.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      Execução e Gestão de Risco
                    </h4>
                    <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed">
                      Quando uma oportunidade é identificada, o sistema calcula automaticamente o tamanho ideal da posição, define pontos de stop-loss dinâmicos e executa a ordem com algoritmos de execução inteligente que minimizam slippage e custos de transação. Tudo isso acontece em menos de 100 milissegundos.
                    </p>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-zinc-800/50">
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-zinc-400 leading-relaxed">
                    <span className="text-white font-semibold">O diferencial?</span> Enquanto investidores tradicionais analisam alguns indicadores manualmente e tomam decisões baseadas em intuição e experiência limitada, nossa IA processa volumes massivos de dados simultaneamente, identifica padrões invisíveis ao olho humano, e executa estratégias testadas por milhões de simulações. O resultado é uma gestão de investimentos consistente, disciplinada e otimizada para máximo retorno ajustado ao risco.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimationContainer>

        {/* Technology Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {technologies.map((tech, index) => (
            <AnimationContainer key={index} delay={0.2 + index * 0.1}>
              <div className={`relative p-5 sm:p-6 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-br ${tech.gradient} border ${tech.borderColor} backdrop-blur-sm transition-colors duration-200 hover:border-opacity-60 h-full flex flex-col`}>
                {/* Header with icon and stat */}
                <div className="flex items-start justify-between mb-5 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-zinc-900/50 border ${tech.borderColor} flex items-center justify-center shrink-0`}>
                    <tech.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${tech.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-xl sm:text-2xl font-bold ${tech.iconColor}`}>
                      {tech.stat}
                    </div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wide">
                      {tech.statLabel}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 sm:space-y-3 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {tech.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              </div>
            </AnimationContainer>
          ))}
        </div>
      </div>
    </section>
  )
}
