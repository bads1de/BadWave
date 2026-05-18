import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type HydrationState, createHydrationPersistConfig } from "./withHydration";

interface PlaybackRateStore extends HydrationState {
  /** 再生速度 (0.5 ~ 1.5) */
  rate: number;
  /** 再生速度を設定する */
  setRate: (rate: number) => void;
}

const usePlaybackRateStore = create<PlaybackRateStore>()(
  persist(
    (set) => ({
      rate: 1.0,
      hasHydrated: false,
      setRate: (rate) => set({ rate }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    createHydrationPersistConfig<PlaybackRateStore>("badwave-playback-rate"),
  )
);

export default usePlaybackRateStore;
