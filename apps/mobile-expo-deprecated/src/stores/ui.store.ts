import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UIStore {
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  setBalanceVisibility: (visible: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isBalanceVisible: true,
      toggleBalanceVisibility: () =>
        set((state) => ({ isBalanceVisible: !state.isBalanceVisible })),
      setBalanceVisibility: (visible: boolean) =>
        set({ isBalanceVisible: visible }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
