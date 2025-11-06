"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Globe as GlobeIcon } from "lucide-react"
import AnimationContainer from "../global/animation-container"
import { AnimatedCounter } from "@/components/ui/animated-counter"

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  ),
})

export const GlobalReach = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const globeConfig = {
    pointSize: 4,
    globeColor: "#1e1b4b",
    showAtmosphere: true,
    atmosphereColor: "#a78bfa",
    atmosphereAltitude: 0.2,
    emissive: "#312e81",
    emissiveIntensity: 0.6,
    shininess: 0.9,
    polygonColor: "rgba(167, 139, 250, 0.8)",
    ambientLight: "#ffffff",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
  }

  const arcsData = [
    // === BRASIL - Múltiplas cidades ===
    // São Paulo → França
    { order: 1, startLat: -23.5505, startLng: -46.6333, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.3, color: "#22d3ee" },
    // Rio de Janeiro → França
    { order: 2, startLat: -22.9068, startLng: -43.1729, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.3, color: "#a78bfa" },
    // Brasília → França
    { order: 3, startLat: -15.7801, startLng: -47.9292, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.3, color: "#ec4899" },
    // Belo Horizonte → França
    { order: 4, startLat: -19.9167, startLng: -43.9345, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.3, color: "#22d3ee" },
    // Porto Alegre → França
    { order: 5, startLat: -30.0346, startLng: -51.2177, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.3, color: "#a78bfa" },
    // Curitiba → França
    { order: 6, startLat: -25.4284, startLng: -49.2733, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.3, color: "#ec4899" },

    // === EUROPA - Múltiplas cidades ===
    // França → Reino Unido (Londres)
    { order: 7, startLat: 48.8566, startLng: 2.3522, endLat: 51.5074, endLng: -0.1278, arcAlt: 0.2, color: "#a78bfa" },
    // França → Alemanha (Berlim)
    { order: 8, startLat: 48.8566, startLng: 2.3522, endLat: 52.52, endLng: 13.405, arcAlt: 0.2, color: "#ec4899" },
    // França → Alemanha (Munique)
    { order: 9, startLat: 48.8566, startLng: 2.3522, endLat: 48.1351, endLng: 11.582, arcAlt: 0.2, color: "#22d3ee" },
    // França → Espanha (Madrid)
    { order: 10, startLat: 48.8566, startLng: 2.3522, endLat: 40.4168, endLng: -3.7038, arcAlt: 0.2, color: "#a78bfa" },
    // França → Espanha (Barcelona)
    { order: 11, startLat: 48.8566, startLng: 2.3522, endLat: 41.3851, endLng: 2.1734, arcAlt: 0.2, color: "#ec4899" },
    // França → Itália (Roma)
    { order: 12, startLat: 48.8566, startLng: 2.3522, endLat: 41.9028, endLng: 12.4964, arcAlt: 0.2, color: "#22d3ee" },
    // França → Itália (Milão)
    { order: 13, startLat: 48.8566, startLng: 2.3522, endLat: 45.4642, endLng: 9.19, arcAlt: 0.2, color: "#a78bfa" },
    // França → Holanda (Amsterdam)
    { order: 14, startLat: 48.8566, startLng: 2.3522, endLat: 52.3702, endLng: 4.8952, arcAlt: 0.2, color: "#ec4899" },
    // França → Portugal (Lisboa)
    { order: 15, startLat: 48.8566, startLng: 2.3522, endLat: 38.7223, endLng: -9.1393, arcAlt: 0.2, color: "#22d3ee" },
    // França → Suíça (Zurique)
    { order: 16, startLat: 48.8566, startLng: 2.3522, endLat: 47.3769, endLng: 8.5417, arcAlt: 0.15, color: "#a78bfa" },
    // França → Bélgica (Bruxelas)
    { order: 17, startLat: 48.8566, startLng: 2.3522, endLat: 50.8503, endLng: 4.3517, arcAlt: 0.15, color: "#ec4899" },
    // França → Áustria (Viena)
    { order: 18, startLat: 48.8566, startLng: 2.3522, endLat: 48.2082, endLng: 16.3738, arcAlt: 0.2, color: "#22d3ee" },
    // França → Polônia (Varsóvia)
    { order: 19, startLat: 48.8566, startLng: 2.3522, endLat: 52.2297, endLng: 21.0122, arcAlt: 0.2, color: "#a78bfa" },
    // França → Suécia (Estocolmo)
    { order: 20, startLat: 48.8566, startLng: 2.3522, endLat: 59.3293, endLng: 18.0686, arcAlt: 0.3, color: "#ec4899" },

    // === ESTADOS UNIDOS - Múltiplas cidades ===
    // França → Nova York
    { order: 21, startLat: 48.8566, startLng: 2.3522, endLat: 40.7128, endLng: -74.006, arcAlt: 0.4, color: "#22d3ee" },
    // França → Los Angeles
    { order: 22, startLat: 48.8566, startLng: 2.3522, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.5, color: "#a78bfa" },
    // França → Chicago
    { order: 23, startLat: 48.8566, startLng: 2.3522, endLat: 41.8781, endLng: -87.6298, arcAlt: 0.4, color: "#ec4899" },
    // França → Miami
    { order: 24, startLat: 48.8566, startLng: 2.3522, endLat: 25.7617, endLng: -80.1918, arcAlt: 0.4, color: "#22d3ee" },
    // França → São Francisco
    { order: 25, startLat: 48.8566, startLng: 2.3522, endLat: 37.7749, endLng: -122.4194, arcAlt: 0.5, color: "#a78bfa" },
    // França → Boston
    { order: 26, startLat: 48.8566, startLng: 2.3522, endLat: 42.3601, endLng: -71.0589, arcAlt: 0.4, color: "#ec4899" },
    // França → Washington DC
    { order: 27, startLat: 48.8566, startLng: 2.3522, endLat: 38.9072, endLng: -77.0369, arcAlt: 0.4, color: "#22d3ee" },
    // França → Dallas
    { order: 28, startLat: 48.8566, startLng: 2.3522, endLat: 32.7767, endLng: -96.797, arcAlt: 0.4, color: "#a78bfa" },

    // === CONEXÕES ÁSIA ===
    // França → Tóquio
    { order: 29, startLat: 48.8566, startLng: 2.3522, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.5, color: "#ec4899" },
    // França → Singapura
    { order: 30, startLat: 48.8566, startLng: 2.3522, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.5, color: "#22d3ee" },
  ]

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[150px] rounded-full"
        />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Header */}
        <AnimationContainer delay={0.1}>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <GlobeIcon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Alcance Global</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-4 sm:px-0">
              Investidores em <span className="bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">Todo o Mundo</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Junte-se a mais de 85 mil investidores em todo o mundo que confiam na STAKLY para fazer seu patrimônio crescer automaticamente
            </p>
          </div>
        </AnimationContainer>

        {/* Stats Grid */}
        <AnimationContainer delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-12 sm:mb-16 md:mb-20">
            <div className="text-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                <AnimatedCounter end={85000} duration={2500} suffix="+" separator={true} />
              </div>
              <div className="text-xs sm:text-sm text-zinc-400">Investidores Ativos</div>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                <AnimatedCounter end={50} duration={2000} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm text-zinc-400">Países</div>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-magenta-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                <AnimatedCounter end={500} duration={2500} prefix="€ " suffix="M+" />
              </div>
              <div className="text-xs sm:text-sm text-zinc-400">Em Investimentos</div>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                24/7
              </div>
              <div className="text-xs sm:text-sm text-zinc-400">Operação Contínua</div>
            </div>
          </div>
        </AnimationContainer>

        {/* Globe */}
        <AnimationContainer delay={0.3}>
          <div className="relative mx-auto max-w-5xl">
            {isMobile ? (
              // Mobile fallback - Static visual representation
              <div className="aspect-[1/1] w-full relative flex items-center justify-center">
                <div className="relative w-full max-w-md mx-auto">
                  {/* Gradient background sphere */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-magenta-500/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />

                  {/* Globe icon with rings */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="relative">
                      {/* Outer ring 1 */}
                      <div className="absolute inset-0 -m-16 sm:-m-20 rounded-full border-2 border-purple-400/20 animate-ping" style={{ animationDuration: '3s' }} />
                      {/* Outer ring 2 */}
                      <div className="absolute inset-0 -m-8 sm:-m-12 rounded-full border-2 border-cyan-400/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                      {/* Main globe icon */}
                      <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-4 border-purple-400/30 flex items-center justify-center backdrop-blur-sm">
                        <GlobeIcon className="w-24 h-24 sm:w-32 sm:h-32 text-purple-300" strokeWidth={1} />
                      </div>
                      {/* Connection dots */}
                      <div className="absolute -top-4 left-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                      <div className="absolute top-1/4 -right-6 w-2 h-2 bg-magenta-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                      <div className="absolute bottom-1/4 -left-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                      <div className="absolute -bottom-4 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
                    </div>
                  </div>

                  {/* Location labels */}
                  <div className="absolute top-8 left-4 text-xs text-purple-300 font-medium">🇧🇷 Brasil</div>
                  <div className="absolute top-12 right-8 text-xs text-cyan-300 font-medium">🇺🇸 EUA</div>
                  <div className="absolute bottom-16 left-8 text-xs text-magenta-300 font-medium">🇫🇷 Europa</div>
                  <div className="absolute bottom-20 right-4 text-xs text-purple-300 font-medium">🇯🇵 Ásia</div>
                </div>
              </div>
            ) : (
              // Desktop - Full 3D Globe
              <div className="aspect-[1/1] md:aspect-[16/9] w-full relative">
                <World data={arcsData} globeConfig={globeConfig} />
              </div>
            )}
          </div>
        </AnimationContainer>
      </div>
    </section>
  )
}
