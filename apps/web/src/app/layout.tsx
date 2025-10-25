import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MVPPIR Admin Dashboard",
  description: "Admin panel for managing users, deposits, withdrawals, and MLM system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
