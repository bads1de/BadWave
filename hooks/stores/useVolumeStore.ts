import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * デスクトップ用ボリューム設定を管理するストア
 * ローカルストレージに永続化される
 */
interface VolumeStore {
  /** 現在のボリューム値 (0-1) */
  volume: number;
  /** ストアがハイドレート完了したかどうか */
  hasHydrated: boolean;
  /** ボリュームを設定する */
  setVolume: (volume: number) => void;
  /** ハイドレート状態を設定する */
  setHasHydrated: (state: boolean) => void;
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
    {
      name: "badwave-volume",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useVolumeStore;
