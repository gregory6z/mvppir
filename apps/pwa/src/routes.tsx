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

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/invite",
    element: <InviteScreen />,
  },
  {
    path: "/signup",
    element: <SignupScreen />,
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
