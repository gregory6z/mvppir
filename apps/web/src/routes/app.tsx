import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { UserSidebar } from "@/components/layout/user-sidebar"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({ to: "/login" })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <UserSidebar />
      {/* Main content - ml-64 on desktop to account for fixed sidebar */}
      <main className="min-h-screen lg:ml-64">
        <div className="p-4 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
