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
      <main className="lg:ml-64 min-h-screen p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto pt-14 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
