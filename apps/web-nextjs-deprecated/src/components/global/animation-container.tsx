"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimationContainerProps {
  children: React.ReactNode
  delay?: number
  reverse?: boolean
  className?: string
}

const AnimationContainer = ({
  children,
  className,
  reverse,
  delay = 0,
}: AnimationContainerProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // No animation on mobile - just render children
  if (isMobile) {
    return <div className={className}>{children}</div>
  }

  // Subtle animation on desktop
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reverse ? -5 : 5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.3,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  )
}

export default AnimationContainer
