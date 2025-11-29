import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "STAKLY - Invista com Inteligência Artificial",
  description:
    "Plataforma de investimentos inteligente que trabalha 24/7 para crescer seu patrimônio. Baixe o app e comece a investir com IA.",
  keywords: [
    "investimento inteligente",
    "inteligência artificial",
    "plataforma de investimentos",
    "gestão automatizada",
    "blockchain",
    "investir com IA",
  ],
  authors: [{ name: "STAKLY" }],
  openGraph: {
    title: "STAKLY - Invista com IA",
    description: "O futuro dos investimentos é agora",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="antialiased h-full" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
