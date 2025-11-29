import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/batch-collect")({
  component: BatchCollectPage,
})

function BatchCollectPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Batch Collect</h1>
      <p className="text-zinc-400">Em breve: conteúdo de batch collect</p>
    </div>
  )
}
