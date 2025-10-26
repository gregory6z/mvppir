import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      token: null,
      userId: null,
      isAuthenticated: false,

      // Actions
      setAuth: (token, userId) =>
        set({
          token,
          userId,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: null,
          userId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
