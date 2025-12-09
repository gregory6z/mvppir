import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { MaticAlert } from "@/components/layout/matic-alert"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await authClient.getSession()

    // Verifica se está autenticado
    if (!session.data?.user) {
      throw redirect({ to: "/e001153a-ea55-4aaf-939a-feac4a3aea86" })
    }

    // Verifica se é admin
    const user = session.data.user as { role?: string }
    if (user.role !== "ADMIN") {
      throw redirect({ to: "/" })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main content - ml-64 to account for fixed sidebar */}
      <main className="min-h-screen ml-64 p-8">
        {/* MATIC Alert */}
        <MaticAlert />

        <Outlet />
      </main>
    </div>
  )
}
