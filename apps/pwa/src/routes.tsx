import { Navigate, createBrowserRouter } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"

// Placeholder screens (serão implementados depois)
function LoginScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="rounded-lg bg-zinc-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Login Screen</h1>
        <p className="mt-2 text-zinc-400">Em desenvolvimento...</p>
      </div>
    </div>
  )
}

function HomeScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="rounded-lg bg-zinc-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Home Screen</h1>
        <p className="mt-2 text-zinc-400">PWA funcionando! ✅</p>
      </div>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginScreen />,
  },

  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomeScreen />
      </ProtectedRoute>
    ),
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
