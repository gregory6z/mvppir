

import { Star, Quote } from "lucide-react"
import AnimationContainer from "../global/animation-container"

const generateTestimonials = (count: number) => {
  const testimonials = []
  const reviews = [
    "Plataforma intuitiva com IA que realmente funciona. Resultados excelentes.",
    "Transparencia total e suporte dedicado. Recomendo fortemente.",
    "Seguranca blockchain e facilidade de uso impressionantes.",
    "Em poucos meses vi crescimento consistente do investimento.",
    "Interface moderna e resultados acima das expectativas.",
    "Tecnologia de ponta com simplicidade. Melhor decisao que tomei.",
    "Investimento seguro e rentavel. Estou muito satisfeito com os resultados.",
    "A IA realmente entrega o que promete. Retornos consistentes.",
    "Suporte rapido e eficiente. Plataforma confiavel.",
    "Melhor plataforma de investimento que ja usei. Altamente recomendavel.",
    "Retornos acima da media do mercado. Muito impressionado.",
    "Sistema automatizado funciona perfeitamente. Zero preocupacoes.",
    "Transparencia e seguranca sao pontos fortes. Confio totalmente.",
    "Comecei pequeno e hoje tenho resultados incriveis.",
    "A tecnologia blockchain da muita seguranca aos investimentos.",
    "Dashboard intuitivo e facil de usar. Ate iniciantes conseguem.",
    "Saques rapidos e sem burocracias. Excelente experiencia.",
    "Diversificacao automatica da carteira e um diferencial grande.",
    "Relatorio detalhado de cada operacao. Total controle.",
    "Nunca vi uma plataforma tao completa e segura.",
  ]

  const locations = [
    { name: "Carlos Silva", city: "Sao Paulo", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Pierre Dubois", city: "Paris", country: "Franca", avatar: "https://i.pravatar.cc/150?img=33" },
    { name: "Michael Johnson", city: "Nova York", country: "EUA", avatar: "https://i.pravatar.cc/150?img=13" },
    { name: "Ana Santos", city: "Rio de Janeiro", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=47" },
    { name: "James Smith", city: "Londres", country: "Reino Unido", avatar: "https://i.pravatar.cc/150?img=14" },
    { name: "Maria Oliveira", city: "Brasilia", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=32" },
    { name: "Antonio Garcia", city: "Barcelona", country: "Espanha", avatar: "https://i.pravatar.cc/150?img=15" },
    { name: "David Williams", city: "Los Angeles", country: "EUA", avatar: "https://i.pravatar.cc/150?img=52" },
    { name: "Lucas Souza", city: "Belo Horizonte", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=11" },
    { name: "Marco Rossi", city: "Roma", country: "Italia", avatar: "https://i.pravatar.cc/150?img=59" },
    { name: "Robert Brown", city: "Miami", country: "EUA", avatar: "https://i.pravatar.cc/150?img=68" },
    { name: "Pedro Costa", city: "Porto Alegre", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=56" },
    { name: "Sophie Martin", city: "Lyon", country: "Franca", avatar: "https://i.pravatar.cc/150?img=36" },
    { name: "Thomas Muller", city: "Munique", country: "Alemanha", avatar: "https://i.pravatar.cc/150?img=17" },
    { name: "Rafael Pereira", city: "Salvador", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=60" },
    { name: "Oliver Schmidt", city: "Berlin", country: "Alemanha", avatar: "https://i.pravatar.cc/150?img=70" },
    { name: "William Taylor", city: "Boston", country: "EUA", avatar: "https://i.pravatar.cc/150?img=51" },
    { name: "Joao Mendes", city: "Curitiba", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=67" },
    { name: "Luis Fernandez", city: "Lisboa", country: "Portugal", avatar: "https://i.pravatar.cc/150?img=58" },
    { name: "Alexandre Leroy", city: "Marseille", country: "Franca", avatar: "https://i.pravatar.cc/150?img=19" },
    { name: "Fernando Alves", city: "Campinas", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=57" },
    { name: "Daniel Martinez", city: "Valencia", country: "Espanha", avatar: "https://i.pravatar.cc/150?img=53" },
    { name: "Bruno Fernandes", city: "Porto", country: "Portugal", avatar: "https://i.pravatar.cc/150?img=61" },
    { name: "Ricardo Santos", city: "Manaus", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=69" },
    { name: "Francesco Conti", city: "Florenca", country: "Italia", avatar: "https://i.pravatar.cc/150?img=16" },
    { name: "Andrew Miller", city: "Portland", country: "EUA", avatar: "https://i.pravatar.cc/150?img=54" },
    { name: "Thiago Rodrigues", city: "Natal", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=64" },
    { name: "Hans Weber", city: "Frankfurt", country: "Alemanha", avatar: "https://i.pravatar.cc/150?img=55" },
    { name: "George Clark", city: "Atlanta", country: "EUA", avatar: "https://i.pravatar.cc/150?img=63" },
    { name: "Matheus Barbosa", city: "Joinville", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=66" },
    { name: "Diego Lopez", city: "Bilbao", country: "Espanha", avatar: "https://i.pravatar.cc/150?img=62" },
    { name: "Ethan Walker", city: "Houston", country: "EUA", avatar: "https://i.pravatar.cc/150?img=18" },
    { name: "Benjamin Lewis", city: "Manchester", country: "Reino Unido", avatar: "https://i.pravatar.cc/150?img=65" },
    { name: "Mason Carter", city: "Philadelphia", country: "EUA", avatar: "https://i.pravatar.cc/150?img=50" },
    { name: "Noah Anderson", city: "San Diego", country: "EUA", avatar: "https://i.pravatar.cc/150?img=71" },
    { name: "Alexander Wright", city: "Liverpool", country: "Reino Unido", avatar: "https://i.pravatar.cc/150?img=20" },
    { name: "Sebastian Wagner", city: "Hamburgo", country: "Alemanha", avatar: "https://i.pravatar.cc/150?img=8" },
    { name: "Gabriel Moreira", city: "Santos", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=7" },
    { name: "Henry Cooper", city: "Glasgow", country: "Reino Unido", avatar: "https://i.pravatar.cc/150?img=6" },
    { name: "Nathan Rodriguez", city: "Tampa", country: "EUA", avatar: "https://i.pravatar.cc/150?img=5" },
    { name: "Leonardo Martins", city: "Florianopolis", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=3" },
    { name: "Julian Bernard", city: "Strasbourg", country: "Franca", avatar: "https://i.pravatar.cc/150?img=2" },
    { name: "Connor Murphy", city: "Dublin", country: "Irlanda", avatar: "https://i.pravatar.cc/150?img=1" },
    { name: "Isabella Ferrari", city: "Milao", country: "Italia", avatar: "https://i.pravatar.cc/150?img=38" },
    { name: "Emily Davis", city: "Chicago", country: "EUA", avatar: "https://i.pravatar.cc/150?img=45" },
    { name: "Charlotte Anderson", city: "Londres", country: "Reino Unido", avatar: "https://i.pravatar.cc/150?img=28" },
    { name: "Gabriela Lima", city: "Fortaleza", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=41" },
    { name: "Camila Rocha", city: "Recife", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=24" },
    { name: "Emma Wilson", city: "San Francisco", country: "EUA", avatar: "https://i.pravatar.cc/150?img=48" },
    { name: "Jennifer Lee", city: "Seattle", country: "EUA", avatar: "https://i.pravatar.cc/150?img=42" },
    { name: "Laura Bianchi", city: "Veneza", country: "Italia", avatar: "https://i.pravatar.cc/150?img=25" },
    { name: "Sarah Johnson", city: "Austin", country: "EUA", avatar: "https://i.pravatar.cc/150?img=31" },
    { name: "Natalie Dupont", city: "Nice", country: "Franca", avatar: "https://i.pravatar.cc/150?img=43" },
    { name: "Hannah White", city: "Denver", country: "EUA", avatar: "https://i.pravatar.cc/150?img=29" },
    { name: "Sofia Rodriguez", city: "Madrid", country: "Espanha", avatar: "https://i.pravatar.cc/150?img=44" },
    { name: "Julia Carvalho", city: "Goiania", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=27" },
    { name: "Carmen Sanchez", city: "Sevilha", country: "Espanha", avatar: "https://i.pravatar.cc/150?img=37" },
    { name: "Olivia Harris", city: "Phoenix", country: "EUA", avatar: "https://i.pravatar.cc/150?img=39" },
    { name: "Patricia Gomes", city: "Vitoria", country: "Brasil", avatar: "https://i.pravatar.cc/150?img=46" },
    { name: "Alessandra Bruno", city: "Napoles", country: "Italia", avatar: "https://i.pravatar.cc/150?img=40" },
  ]

  for (let i = 0; i < count; i++) {
    const person = locations[i % locations.length]

    testimonials.push({
      name: person.name,
      location: `${person.city}, ${person.country}`,
      avatar: person.avatar,
      rating: 5,
      text: reviews[i % reviews.length],
    })
  }

  return testimonials
}

const TestimonialCard = ({ testimonial }: { testimonial: any }) => (
  <div className="group relative p-5 sm:p-6 rounded-xl md:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 h-full lg:w-[340px] lg:flex-shrink-0">
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
    </div>

    <div className="flex gap-1 mb-3 sm:mb-4">
      {Array.from({ length: testimonial.rating }).map((_, i) => (
        <Star
          key={i}
          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400"
        />
      ))}
    </div>

    <p className="text-zinc-300 mb-4 sm:mb-5 md:mb-6 leading-relaxed text-sm">
      &quot;{testimonial.text}&quot;
    </p>

    <div className="flex items-center gap-2 sm:gap-3">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-purple-500/20"
      />
      <div>
        <div className="text-white font-semibold text-sm">
          {testimonial.name}
        </div>
        <div className="text-zinc-500 text-xs">
          {testimonial.location}
        </div>
      </div>
    </div>
  </div>
)

export const Testimonials = () => {
  const testimonials = generateTestimonials(60)

  return (
    <section id="testimonials" className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full"
        />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 mx-auto max-w-7xl mb-12 sm:mb-16 md:mb-20">
        <AnimationContainer delay={0.1}>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span className="text-sm text-cyan-300 font-medium">Depoimentos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-4 sm:px-0">
              O que nossos <span className="bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">investidores dizem</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Mais de 85 mil investidores em todo o mundo confiam na STAKLY para fazer seu patrimonio crescer
            </p>
          </div>
        </AnimationContainer>
      </div>

      {/* Mobile: Grid estático */}
      <div className="lg:hidden container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <AnimationContainer key={index} delay={0.1 + index * 0.05}>
              <TestimonialCard testimonial={testimonial} />
            </AnimationContainer>
          ))}
        </div>

        {/* Stats totais */}
        <AnimationContainer delay={0.4}>
          <div className="text-center">
            <p className="text-zinc-400 text-sm">
              <span className="text-cyan-400 font-semibold">+85.000 investidores</span> já confiam na STAKLY
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
              <span className="text-white font-semibold ml-2">5.0</span>
              <span className="text-zinc-500 text-sm ml-1">(48.450 avaliações)</span>
            </div>
          </div>
        </AnimationContainer>
      </div>

      {/* Desktop: Scroll infinito */}
      <div className="relative hidden lg:block">
        {/* Fade gradients nos cantos */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Row 1 - Moving Left */}
        <div className="mb-4 sm:mb-5 md:mb-6 overflow-hidden">
          <div className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-scroll-left">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Row 2 - Moving Right */}
        <div className="mb-4 sm:mb-5 md:mb-6 overflow-hidden">
          <div className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-scroll-right">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Row 3 - Moving Left */}
        <div className="overflow-hidden">
          <div className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-scroll-left">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <TestimonialCard key={`row3-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
