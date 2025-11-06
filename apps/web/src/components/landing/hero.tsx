"use client"

import { Sparkles } from "lucide-react"
import AnimationContainer from "../global/animation-container"
import { AppStoreBadge } from "./app-store-badge"
import { GooglePlayBadge } from "./google-play-badge"
import { ContainerTextFlip } from "../ui/container-text-flip"
import { IPhoneMockup } from "react-device-mockup"
import { CardContainer, CardBody, CardItem } from "../ui/3d-card"
import { SparklesCore } from "../ui/sparkles"

export const Hero = () => {
  const words = ["Inteligentes", "Estratégicos", "Automatizados", "Lucrativos"]

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient layer */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(at 0% 0%, rgba(157, 131, 231, 0.15) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(212, 69, 231, 0.12) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 203, 244, 0.1) 0%, transparent 50%), radial-gradient(at 0% 100%, rgba(157, 131, 231, 0.08) 0%, transparent 50%)',
          }}
        />

        {/* Mesh blur layers */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-[float_15s_ease-in-out_infinite]" />
        <div className="absolute top-[15%] right-[15%] w-[400px] h-[400px] bg-magenta-500/15 rounded-full blur-[100px] animate-[float_18s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-[20%] left-[10%] w-[450px] h-[450px] bg-cyan-400/12 rounded-full blur-[110px] animate-[float_20s_ease-in-out_infinite_4s]" />
        <div className="absolute top-[40%] right-[25%] w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[100px] animate-[float_16s_ease-in-out_infinite_3s]" />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      </div>

      {/* Decorative Shapes - With colorful blur effect and subtle float animation */}
      {/* Blur Shape 1 - Top Right (Purple) */}
      <div className="absolute top-20 right-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-purple-500/10 blur-[40px] animate-[float_8s_ease-in-out_infinite]" />

      {/* Blur Shape 2 - Top Left (Cyan) */}
      <div className="absolute top-40 left-[5%] w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-cyan-400/10 blur-[40px] animate-[float_10s_ease-in-out_infinite_2s]" />

      {/* Blur Shape 3 - Bottom Left (Magenta) - Subtle */}
      <div className="absolute bottom-32 left-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-magenta-500/8 blur-[60px] animate-[float_12s_ease-in-out_infinite_1s]" />

      {/* Blur Shape 4 - Bottom Right (Purple) - Subtle */}
      <div className="absolute bottom-48 right-[8%] w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-purple-400/8 blur-[55px] animate-[float_9s_ease-in-out_infinite_3s]" />

      {/* Blur Shape 5 - Middle Right (Cyan/Purple gradient) */}
      <div className="absolute top-1/2 right-[5%] w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-cyan-400/10 to-purple-500/10 blur-[40px] animate-[float_11s_ease-in-out_infinite_1.5s]" />

      <div className="container relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 mx-auto h-full flex items-center">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20 items-center max-w-7xl mx-auto w-full">
          {/* Left side - Content */}
          <div className="text-center md:text-center lg:text-left space-y-5 sm:space-y-6 lg:space-y-7 scale-90 origin-center">
            {/* Badge */}
            <AnimationContainer delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/10 via-magenta-500/10 to-cyan-400/10 border border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
                {/* Sparkles background effect */}
                <div className="absolute inset-0 opacity-40">
                  <SparklesCore
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={50}
                    className="w-full h-full"
                    particleColor="#ffffff"
                    speed={2}
                  />
                </div>
                {/* Shimmer effect - always running */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-shimmer" />
                <Sparkles className="h-3 w-3 text-cyan-400 relative z-10" />
                <span className="text-xs sm:text-sm text-white relative z-10 font-medium">
                  Invista com Inteligência Artificial
                </span>
              </div>
            </AnimationContainer>

            {/* Headline - Mobile-first responsive */}
            <AnimationContainer delay={0.2}>
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight text-white">
                  Investimentos
                </h1>
                <ContainerTextFlip
                  words={words}
                  className="!bg-transparent !shadow-none !border-none !p-0 !text-3xl sm:!text-4xl md:!text-5xl lg:!text-6xl xl:!text-7xl"
                  textClassName="!text-white"
                  animationDuration={500}
                  interval={3000}
                />
              </div>
            </AnimationContainer>

            {/* Subheadline - Mobile-first responsive */}
            <AnimationContainer delay={0.3}>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-200 max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0">
                A plataforma de investimento inteligente que usa IA para fazer seu dinheiro crescer automaticamente - sem você precisar fazer nada
              </p>
            </AnimationContainer>

            {/* App Download Buttons - Mobile-first touch-friendly (min 44px height) */}
            <AnimationContainer delay={0.4}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:items-start gap-3 sm:gap-4">
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
            </AnimationContainer>

            {/* Stats - Mobile-first responsive (3 cols always, stacked on very small) */}
            <AnimationContainer delay={0.6}>
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-zinc-800/50 max-w-lg mx-auto lg:mx-0">
                <div className="text-center md:text-left">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">€500M+</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-zinc-400 mt-1">Em ativos</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">85K+</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-zinc-400 mt-1">Investidores</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">22%</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-zinc-400 mt-1">ROI médio</div>
                </div>
              </div>
            </AnimationContainer>
          </div>

          {/* Right side - Phone Mockup + Info Cards grouped harmoniously */}
          <AnimationContainer delay={0.3} className="relative hidden lg:flex items-center justify-center xl:justify-end">
            {/* Unified container */}
            <div className="relative flex items-center gap-6 lg:gap-8 xl:gap-10">
              {/* Phone Mockup */}
              <div className="relative w-full max-w-[280px] lg:max-w-[320px] xl:max-w-[370px] scale-90 origin-center">
                {/* Subtle glow behind phone */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[650px] xl:w-[500px] xl:h-[700px] bg-purple-500/5 blur-[80px] rounded-full" />
                </div>

                {/* iPhone Mockup with react-device-mockup */}
                <div className="relative">
                  <IPhoneMockup
                    screenWidth={316}
                    screenType="island"
                    frameColor="#18181b"
                    statusbarColor="#000000"
                  >
                    <div className="w-full h-full bg-gradient-to-b from-zinc-950 to-black overflow-hidden">
                      {/* Screen content */}
                      <div className="p-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="h-9 xl:h-10 w-28 xl:w-32 bg-zinc-800/50 rounded" />
                          <div className="h-9 xl:h-10 w-9 xl:w-10 bg-zinc-800/50 rounded-full" />
                        </div>

                        {/* Balance Card - Gray style */}
                        <div className="relative p-7 xl:p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm overflow-hidden">
                          <div className="space-y-2 xl:space-y-3 relative z-10">
                            <div className="text-sm xl:text-base text-zinc-400">Saldo Total</div>
                            <div className="text-3xl xl:text-4xl font-bold text-white">€ 45.890</div>
                            <div className="text-sm xl:text-base text-green-400 font-medium">+2.2% este mês</div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="h-3 w-20 bg-zinc-800/50 rounded" />
                            <div className="h-3 w-16 bg-zinc-800/50 rounded" />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="h-3 w-24 bg-zinc-800/50 rounded" />
                            <div className="h-3 w-12 bg-zinc-800/50 rounded" />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-2">
                            <div className="h-6 w-6 bg-zinc-800/30 rounded" />
                            <div className="h-2 w-12 bg-zinc-800/50 rounded" />
                          </div>
                          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-2">
                            <div className="h-6 w-6 bg-zinc-800/30 rounded" />
                            <div className="h-2 w-12 bg-zinc-800/50 rounded" />
                          </div>
                        </div>

                        {/* Bottom Cards - Gray style */}
                        <div className="space-y-2 pt-2">
                          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-800/30" />
                              <div className="flex-1">
                                <div className="h-2 w-16 bg-zinc-800/50 rounded mb-1" />
                                <div className="h-2 w-12 bg-zinc-800/50 rounded" />
                              </div>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-800/30" />
                              <div className="flex-1">
                                <div className="h-2 w-20 bg-zinc-800/50 rounded mb-1" />
                                <div className="h-2 w-16 bg-zinc-800/50 rounded" />
                              </div>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-zinc-800/30" />
                              <div className="flex-1">
                                <div className="h-2 w-14 bg-zinc-800/50 rounded mb-1" />
                                <div className="h-2 w-10 bg-zinc-800/50 rounded" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </IPhoneMockup>
                </div>
              </div>

              {/* Info Cards - Right Side - More colorful */}
              <div className="hidden xl:flex flex-col gap-5 scale-90 origin-center">
              {/* Growth Chart Card - Purple/Magenta theme */}
              <CardContainer containerClassName="py-0">
                <CardBody className="relative bg-gradient-to-br from-purple-900/40 via-magenta-900/30 to-purple-900/40 backdrop-blur-md rounded-2xl p-5 shadow-2xl border-2 border-purple-400/60 w-[260px] h-auto overflow-hidden">
                  <div className="space-y-3 relative z-10">
                    <CardItem translateZ="100" className="w-full flex items-center justify-between">
                      <span className="text-sm text-purple-300 font-medium">ROI Anual</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 font-semibold border border-green-400/30">+22%</span>
                    </CardItem>
                    {/* Simple line chart representation */}
                    <CardItem translateZ="150" className="relative h-20 w-full">
                      <svg className="w-full h-full" viewBox="0 0 200 60" fill="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="200" y2="0">
                            <stop offset="0%" stopColor="#9D83E7" />
                            <stop offset="50%" stopColor="#D445E7" />
                            <stop offset="100%" stopColor="#10CBF4" />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <path
                          d="M0 50 L40 35 L80 40 L120 20 L160 25 L200 10"
                          stroke="url(#chartGradient)"
                          strokeWidth="5"
                          fill="none"
                          strokeLinecap="round"
                          filter="url(#glow)"
                        />
                      </svg>
                    </CardItem>
                    <CardItem translateZ="120" className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-magenta-300 to-cyan-300 bg-clip-text text-transparent">
                      € 45.890
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>

              {/* Transaction Success Card - Cyan/Green theme */}
              <CardContainer containerClassName="py-0">
                <CardBody className="relative bg-gradient-to-br from-cyan-900/40 via-green-900/30 to-cyan-900/40 backdrop-blur-md rounded-2xl p-5 shadow-2xl border-2 border-cyan-400/60 w-[260px] h-auto overflow-hidden">
                  <div className="space-y-3 relative z-10">
                    <CardItem translateZ="100" className="w-full flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/30 to-cyan-500/30 flex items-center justify-center border-2 border-green-400/40">
                        <svg className="w-7 h-7 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-cyan-300 font-medium">Última transação</div>
                        <div className="text-xs text-cyan-400/70">há 2 minutos</div>
                      </div>
                    </CardItem>
                    <CardItem translateZ="150" className="text-2xl font-bold text-green-300">
                      +€ 1.250,00
                    </CardItem>
                    <CardItem translateZ="80" className="text-sm text-green-300 font-medium px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-400/30 inline-block">
                      ✓ Investimento concluído
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>

              {/* Active Users Card - Purple theme mais sutil */}
              <CardContainer containerClassName="py-0">
                <CardBody className="relative bg-gradient-to-br from-purple-900/30 via-zinc-900/50 to-purple-900/30 backdrop-blur-md rounded-2xl p-5 shadow-2xl border-2 border-purple-400/50 w-[260px] h-auto overflow-hidden">
                  <div className="space-y-3 relative z-10">
                    <CardItem translateZ="100" className="w-full flex items-center justify-between">
                      <span className="text-sm text-purple-300 font-medium">Usuários Ativos</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">Online</span>
                      </div>
                    </CardItem>

                    <CardItem translateZ="150" className="w-full flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-white">15.2k</div>
                      <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 font-semibold border border-green-400/30">+18%</div>
                    </CardItem>

                    {/* Active users avatars - Real photos */}
                    <CardItem translateZ="80" className="w-full flex items-center justify-between pt-2 border-t border-purple-500/20">
                      <div className="flex -space-x-3">
                        {/* Avatar 1 - Real person */}
                        <img
                          src="https://i.pravatar.cc/150?img=12"
                          alt="User"
                          className="w-9 h-9 rounded-full border-2 border-zinc-900 object-cover ring-2 ring-purple-500/30"
                        />
                        {/* Avatar 2 - Real person */}
                        <img
                          src="https://i.pravatar.cc/150?img=47"
                          alt="User"
                          className="w-9 h-9 rounded-full border-2 border-zinc-900 object-cover ring-2 ring-purple-500/30"
                        />
                        {/* Avatar 3 - Real person */}
                        <img
                          src="https://i.pravatar.cc/150?img=33"
                          alt="User"
                          className="w-9 h-9 rounded-full border-2 border-zinc-900 object-cover ring-2 ring-purple-500/30"
                        />
                        {/* Avatar 4 - Real person */}
                        <img
                          src="https://i.pravatar.cc/150?img=68"
                          alt="User"
                          className="w-9 h-9 rounded-full border-2 border-zinc-900 object-cover ring-2 ring-purple-500/30"
                        />
                        {/* +More indicator */}
                        <div className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-purple-600/80 flex items-center justify-center text-xs font-bold text-white ring-2 ring-purple-500/30">
                          +9
                        </div>
                      </div>
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            </div>
            </div>
          </AnimationContainer>
        </div>
      </div>

      {/* Plasma gradient divider at bottom - More visible */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/60 via-magenta-400/60 via-cyan-300/60 to-transparent shadow-[0_0_10px_rgba(157,131,231,0.3)]" />
    </section>
  )
}
