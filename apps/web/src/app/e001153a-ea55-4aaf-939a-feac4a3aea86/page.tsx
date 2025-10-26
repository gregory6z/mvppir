import { AdminLoginForm } from "@/components/admin/admin-login-form"

export const metadata = {
  title: "Admin Login",
  description: "Secure admin access",
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

      {/* Glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Content */}
      <div className="relative z-10 px-4">
        <AdminLoginForm />
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  )
}
