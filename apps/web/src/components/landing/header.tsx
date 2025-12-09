import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Menu, X } from "lucide-react"

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: "Recursos", href: "#features" },
    { label: "Como Funciona", href: "#how-it-works" },
    { label: "Tecnologia IA", href: "#ai-technology" },
    { label: "Investidores", href: "#global-reach" },
  ]

  const scrollToSection = (href: string) => {
    const section = document.querySelector(href)
    section?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Modern gradient style */}
          <button
            onClick={() => scrollToSection("#hero")}
            className="flex items-center gap-3 group cursor-pointer"
          >
            {/* Logo SVG with gradient filter */}
            <div className="relative w-6 h-6 sm:w-7 sm:h-7">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 group-hover:from-purple-300 group-hover:via-magenta-300 group-hover:to-cyan-300 transition-all duration-300" style={{ maskImage: "url(/logo.svg)", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center", WebkitMaskImage: "url(/logo.svg)", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} />
            </div>
            {/* Text */}
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-magenta-300 group-hover:to-cyan-300 transition-all duration-300">
              STAKLY
            </span>
          </button>

          {/* Desktop Navigation - Linkify style */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-sm text-zinc-400 hover:text-white transition-colors font-medium cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            {/* Auth Buttons */}
            <Link
              to="/login"
              search={{ redirect: "/app/dashboard" }}
              className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              search={{ ref: "" }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30"
            >
              Criar Conta
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Linkify style */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-6 pb-6 border-t border-white/10 pt-6 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-3 px-4 hover:bg-white/5 rounded-lg font-medium cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            {/* Mobile Auth Buttons */}
            <Link
              to="/login"
              search={{ redirect: "/app/dashboard" }}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-3 px-4 hover:bg-white/5 rounded-lg font-medium"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              search={{ ref: "" }}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 text-center"
            >
              Criar Conta
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
