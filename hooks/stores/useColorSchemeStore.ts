import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_COLOR_SCHEME_ID,
  getColorSchemeById,
  type ColorScheme,
} from "@/constants/colorSchemes";
import { type HydrationState, createHydrationPersistConfig } from "./withHydration";

interface ColorSchemeStore extends HydrationState {
  colorSchemeId: string;
  getColorScheme: () => ColorScheme;
  setColorScheme: (id: string) => void;
}

const useColorSchemeStore = create<ColorSchemeStore>()(
  persist(
    (set, get) => ({
      colorSchemeId: DEFAULT_COLOR_SCHEME_ID,
      hasHydrated: false,
      getColorScheme: () => getColorSchemeById(get().colorSchemeId),
      setColorScheme: (id: string) => set({ colorSchemeId: id }),
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
    }),
    createHydrationPersistConfig<ColorSchemeStore>("badwave-color-scheme"),
  )
);

export default useColorSchemeStore;
