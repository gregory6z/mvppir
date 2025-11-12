import { Navigate, createBrowserRouter } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import { LoginScreen } from "@/screens/auth/LoginScreen"
import { SignupScreen } from "@/screens/auth/SignupScreen"
import { InviteScreen } from "@/screens/auth/InviteScreen"
import { HomeScreen } from "@/screens/home/HomeScreen"

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirects to home if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  // Public routes (redirect to home if authenticated)
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginScreen />
      </PublicRoute>
    ),
  },
  {
    path: "/invite",
    element: (
      <PublicRoute>
        <InviteScreen />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignupScreen />
      </PublicRoute>
    ),
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
