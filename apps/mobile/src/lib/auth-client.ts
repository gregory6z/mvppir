import { createAuthClient } from "better-auth/react";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

export const authClient = createAuthClient({
  baseURL: API_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
