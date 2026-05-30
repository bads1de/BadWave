import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type HydrationState, createHydrationPersistConfig } from "./withHydration";

interface NightCoreStore extends HydrationState {
  /** NightCoreモードが有効かどうか */
  isEnabled: boolean;
  /** NightCoreモードをON/OFFする */
  toggle: () => void;
  /** NightCoreモードを設定する */
  setEnabled: (enabled: boolean) => void;
}

const useNightCoreStore = create<NightCoreStore>()(
  persist(
    (set) => ({
      isEnabled: false,
      hasHydrated: false,
      toggle: () => set((state) => ({ isEnabled: !state.isEnabled })),
      setEnabled: (enabled) => set({ isEnabled: enabled }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    createHydrationPersistConfig<NightCoreStore>("badwave-nightcore"),
  )
);

export default useNightCoreStore;