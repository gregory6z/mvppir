"use client"

import { SparklesCore } from "../ui/sparkles"

export const CTASection = () => {
  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Comece a Investir com{" "}
            <span className="bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">
              IA Hoje
            </span>
          </h2>

          <p className="text-xl text-zinc-400">
            Junte-se a mais de 85 mil investidores que já confiam na STAKLY
          </p>

          {/* Download buttons - Identical to Hero */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4">
            {/* App Store Button */}
            <button className="group relative px-5 sm:px-8 py-3 sm:py-4 bg-zinc-900/80 hover:bg-zinc-800/80 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-2xl border-2 border-purple-500/40 hover:border-purple-400/60 w-full sm:w-auto sm:min-w-[220px] cursor-pointer touch-manipulation overflow-hidden">
              {/* Sparkles effect always active */}
              <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
                <SparklesCore
                  background="transparent"
                  minSize={0.5}
                  maxSize={1.2}
                  particleDensity={35}
                  className="w-full h-full"
                  particleColor="#ffffff"
                  speed={2}
                />
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    fill="white"
                  />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Download</div>
                  <div className="text-sm sm:text-lg font-bold text-white -mt-0.5">iOS</div>
                </div>
              </div>
            </button>

            {/* Google Play Button */}
            <button className="group relative px-5 sm:px-8 py-3 sm:py-4 bg-zinc-900/80 hover:bg-zinc-800/80 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-2xl border-2 border-cyan-400/40 hover:border-cyan-400/60 w-full sm:w-auto sm:min-w-[220px] cursor-pointer touch-manipulation overflow-hidden">
              {/* Sparkles effect always active */}
              <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
                <SparklesCore
                  background="transparent"
                  minSize={0.5}
                  maxSize={1.2}
                  particleDensity={35}
                  className="w-full h-full"
                  particleColor="#ffffff"
                  speed={2}
                />
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35z" fill="url(#playGradient1)" />
                  <path d="M16.81 15.12l-3.12-3.12-9.85 9.85c.24.12.5.19.79.19.34 0 .67-.09.97-.26l11.21-6.66z" fill="url(#playGradient2)" />
                  <path d="M3.84 2.15c-.5.24-.84.76-.84 1.35v17c0 .59.34 1.11.84 1.35L13.69 12 3.84 2.15z" fill="url(#playGradient3)" />
                  <path d="M13.69 12l3.12-3.12L5.6 2.22c-.3-.17-.63-.26-.97-.26-.29 0-.55.07-.79.19L13.69 12z" fill="url(#playGradient4)" />
                  <defs>
                    <linearGradient id="playGradient1" x1="9.42" y1="4.68" x2="2.03" y2="12.07" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00A0FF" />
                      <stop offset="1" stopColor="#00E3FF" />
                    </linearGradient>
                    <linearGradient id="playGradient2" x1="15.5" y1="13.89" x2="4.5" y2="24.89" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF3A44" />
                      <stop offset="1" stopColor="#C31162" />
                    </linearGradient>
                    <linearGradient id="playGradient3" x1="9.42" y1="4.68" x2="2.03" y2="12.07" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00A0FF" />
                      <stop offset="1" stopColor="#00E3FF" />
                    </linearGradient>
                    <linearGradient id="playGradient4" x1="4.78" y1="1.51" x2="10.78" y2="7.51" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#32A071" />
                      <stop offset="1" stopColor="#00F076" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Download</div>
                  <div className="text-sm sm:text-lg font-bold text-white -mt-0.5">Android</div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-sm text-zinc-500 pt-4">
            Disponível para iOS e Android
          </p>
        </div>
      </div>
    </section>
  )
}
