import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface UIStore {
  isBalanceVisible: boolean
  toggleBalanceVisibility: () => void
  setBalanceVisibility: (visible: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isBalanceVisible: true,
      toggleBalanceVisibility: () =>
        set((state) => ({ isBalanceVisible: !state.isBalanceVisible })),
      setBalanceVisibility: (visible: boolean) => set({ isBalanceVisible: visible }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
