import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",
  fetchOptions: {
    credentials: "include",
  },
})

export const { signOut, useSession } = authClient

// Sign in helper
export const signInEmail = authClient.signIn.email

// Sign up helper
export const signUpEmail = authClient.signUp.email

// Exporta tipos inferidos
export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user
