"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push("/admin/e001153a-ea55-4aaf-939a-feac4a3aea86")
      } else if (!isAdmin) {
        // Authenticated but not admin, redirect to home
        router.push("/")
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-zinc-950">
        <div className="w-64 border-r border-white/10 p-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated or not admin - return null (will redirect in useEffect)
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  // Render admin layout
  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
