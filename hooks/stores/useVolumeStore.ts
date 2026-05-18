import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type HydrationState, createHydrationPersistConfig } from "./withHydration";

/**
 * デスクトップ用ボリューム設定を管理するストア
 * ローカルストレージに永続化される
 */
interface VolumeStore extends HydrationState {
  /** 現在のボリューム値 (0-1) */
  volume: number;
  /** ボリュームを設定する */
  setVolume: (volume: number) => void;
}

/** デスクトップのデフォルトボリューム */
export const DEFAULT_DESKTOP_VOLUME = 0.1;

const useVolumeStore = create<VolumeStore>()(
  persist(
    (set) => ({
      volume: DEFAULT_DESKTOP_VOLUME,
      hasHydrated: false,
      setVolume: (volume: number) =>
        set({ volume: Math.max(0, Math.min(1, volume)) }),
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
    }),
    createHydrationPersistConfig<VolumeStore>("badwave-volume"),
  )
);

export default useVolumeStore;
