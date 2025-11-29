import { useSession, signOut as betterAuthSignOut } from "@/lib/auth-client"
import { signInEmail } from "@/lib/auth-client"

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

export function useAuth() {
  const session = useSession()
  const user = session.data?.user as ExtendedUser | undefined

  return {
    user,
    isLoading: session.isPending,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    session: session.data,
  }
}

export async function signIn(credentials: { email: string; password: string }) {
  return signInEmail(credentials)
}

export async function signOut() {
  return betterAuthSignOut()
}
