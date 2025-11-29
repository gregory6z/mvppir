import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <p className="text-zinc-400">Em breve: conteúdo do dashboard</p>
    </div>
  )
}
