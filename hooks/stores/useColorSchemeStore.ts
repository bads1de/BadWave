import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_COLOR_SCHEME_ID,
  getColorSchemeById,
  type ColorScheme,
} from "@/constants/colorSchemes";

interface ColorSchemeStore {
  colorSchemeId: string;
  getColorScheme: () => ColorScheme;
  setColorScheme: (id: string) => void;
}

const useColorSchemeStore = create<ColorSchemeStore>()(
  persist(
    (set, get) => ({
      colorSchemeId: DEFAULT_COLOR_SCHEME_ID,
      getColorScheme: () => getColorSchemeById(get().colorSchemeId),
      setColorScheme: (id: string) => set({ colorSchemeId: id }),
    }),
    {
      name: "badwave-color-scheme",
    }
  )
);

export default useColorSchemeStore;
