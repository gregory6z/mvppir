import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "MVPPIR",
  description: "Cryptocurrency platform with MLM system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="antialiased h-full overflow-hidden" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
