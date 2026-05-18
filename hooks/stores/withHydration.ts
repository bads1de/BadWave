/**
 * ハイドレーション状態を追加する型
 */
export interface HydrationState {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

/**
 * ハイドレーションの初期状態
 */
export const hydrationInitialState: HydrationState = {
  hasHydrated: false,
  setHasHydrated: () => {},
};

/**
 * ハイドレーションのアクションを生成する
 *
 * @param set - Zustandのset関数
 * @returns ハイドレーションアクション
 */
export function createHydrationActions(
  set: (partial: Partial<HydrationState>) => void,
): Pick<HydrationState, "setHasHydrated"> {
  return {
    setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
  };
}

/**
 * Zustand persist設定にハイドレーション設定を追加するヘルパー
 *
 * useVolumeStore, useColorSchemeStore, useEqualizerStore, usePlaybackStateStore,
 * usePlaybackRateStore, useEffectStore, useSpatialStore, useSearchHistoryStore で
 * 重複していた onRehydrateStorage パターンを共通化。
 *
 * @param storageName - ストレージのキー名
 * @returns persist設定のハイドレーション部分
 */
export function createHydrationPersistConfig<T extends HydrationState>(storageName: string) {
  return {
    name: storageName,
    onRehydrateStorage: () => (state: T | undefined) => {
      state?.setHasHydrated(true);
    },
  };
}
