import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type HydrationState, createHydrationPersistConfig } from "./withHydration";

interface SpatialStore extends HydrationState {
  isSpatialEnabled: boolean;
  toggleSpatialEnabled: () => void;
}

const useSpatialStore = create<SpatialStore>()(
  persist(
    (set) => ({
      isSpatialEnabled: false,
      toggleSpatialEnabled: () =>
        set((state) => ({ isSpatialEnabled: !state.isSpatialEnabled })),
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    createHydrationPersistConfig<SpatialStore>("badwave-spatial-store"),
  )
);

export default useSpatialStore;
