import {
  useSession,
  signOut as betterAuthSignOut,
  signInEmail,
  signUpEmail,
} from "@/lib/auth-client"

// Estende o tipo User para incluir campos customizados
type ExtendedUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
  role?: string
  status?: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

// Export signOut directly for components that need it outside of hook
export const signOut = betterAuthSignOut

export function useAuth() {
  const session = useSession()
  const user = session.data?.user as ExtendedUser | undefined

  return {
    user,
    isLoading: session.isPending,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    session: session.data,
    signInEmail,
    signUpEmail,
    signOut: betterAuthSignOut,
  }
}
