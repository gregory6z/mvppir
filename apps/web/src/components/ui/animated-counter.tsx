

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
  separator?: boolean
}

export const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
  separator = true,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Intersection Observer - só anima quando entra na tela
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  // Animação do contador
  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function (easeOutExpo) - animação mais suave
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      const currentCount = easeOutExpo * end

      setCount(decimals > 0 ? currentCount : Math.floor(currentCount))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration, decimals])

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals)
    }
    if (separator) {
      return num.toLocaleString("pt-BR")
    }
    return num.toString()
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  )
}
