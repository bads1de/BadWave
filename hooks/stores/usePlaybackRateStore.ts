import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlaybackRateStore {
  /** 再生速度 (0.5 ~ 1.5) */
  rate: number;
  /** ストアがハイドレート済みかどうか */
  hasHydrated: boolean;
  /** 再生速度を設定する */
  setRate: (rate: number) => void;
  /** ハイドレート状態を設定する */
  setHasHydrated: (state: boolean) => void;
}

const usePlaybackRateStore = create<PlaybackRateStore>()(
  persist(
    (set) => ({
      rate: 1.0,
      hasHydrated: false,
      setRate: (rate) => set({ rate }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "badwave-playback-rate",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default usePlaybackRateStore;
