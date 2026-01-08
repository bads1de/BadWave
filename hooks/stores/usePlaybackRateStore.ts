import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlaybackRateStore {
  /** 再生速度 (0.5 ~ 1.5) */
  rate: number;
  /** Slowed + Reverb モードが有効かどうか */
  isSlowedReverb: boolean;
  /** ストアがハイドレート済みかどうか */
  hasHydrated: boolean;
  /** 再生速度を設定する */
  setRate: (rate: number) => void;
  /** Slowed + Reverb モードを設定する */
  setIsSlowedReverb: (state: boolean) => void;
  /** ハイドレート状態を設定する */
  setHasHydrated: (state: boolean) => void;
}

const usePlaybackRateStore = create<PlaybackRateStore>()(
  persist(
    (set) => ({
      rate: 1.0,
      isSlowedReverb: false,
      hasHydrated: false,
      setRate: (rate) => set({ rate }),
      setIsSlowedReverb: (isSlowedReverb) => set({ isSlowedReverb }),
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
