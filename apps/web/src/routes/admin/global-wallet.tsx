import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/global-wallet")({
  component: GlobalWalletPage,
})

function GlobalWalletPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Global Wallet</h1>
      <p className="text-zinc-400">Em breve: conteúdo do global wallet</p>
    </div>
  )
}
