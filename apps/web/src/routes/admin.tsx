import { createFileRoute, Outlet } from "@tanstack/react-router"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { MaticAlert } from "@/components/layout/matic-alert"

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* MATIC Alert */}
      <MaticAlert />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
