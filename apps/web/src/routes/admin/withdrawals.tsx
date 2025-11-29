import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/withdrawals")({
  component: WithdrawalsPage,
})

function WithdrawalsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Withdrawals</h1>
      <p className="text-zinc-400">Em breve: conteúdo de withdrawals</p>
    </div>
  )
}
