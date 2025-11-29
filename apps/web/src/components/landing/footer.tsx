export const Footer = () => {
  const footerLinks = {
    produto: [
      { label: "Como funciona", href: "#how-it-works" },
      { label: "Recursos", href: "#features" },
      { label: "Segurança", href: "#" },
      { label: "FAQ", href: "#" },
    ],
    empresa: [
      { label: "Sobre nós", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carreira", href: "#" },
    ],
    legal: [
      { label: "Termos de Uso", href: "#" },
      { label: "Política de Privacidade", href: "#" },
      { label: "LGPD", href: "#" },
    ],
  }

  return (
    <footer id="footer" className="bg-black border-t border-zinc-900">
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient-blue mb-4">
              STAKLY
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Plataforma de investimentos inteligente baseada em IA.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2">
              {footerLinks.produto.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-[--color-stakly-blue] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-[--color-stakly-blue] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contato */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-[--color-stakly-blue] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-zinc-900 text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} STAKLY. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
