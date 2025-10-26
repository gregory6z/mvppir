import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  fetchOptions: {
    credentials: "include",
  },
})

export const { signIn, signOut, useSession } = authClient

// Exporta tipos inferidos
export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user
