

export const FloatingParticles = () => {
  const colors = [
    "from-[--color-stakly-blue]/50 to-purple-500/50",
    "from-purple-500/50 to-pink-500/50",
    "from-[--color-stakly-green]/50 to-cyan-400/50",
    "from-cyan-400/50 to-[--color-stakly-blue]/50",
    "from-pink-500/50 to-purple-600/50",
  ]

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 12,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full bg-gradient-to-r ${particle.color} blur-sm animate-float shadow-lg`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
