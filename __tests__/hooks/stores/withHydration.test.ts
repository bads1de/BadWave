import {
  hydrationInitialState,
  createHydrationActions,
  createHydrationPersistConfig,
} from "@/hooks/stores/withHydration";

describe("hooks/stores/withHydration", () => {
  describe("hydrationInitialState", () => {
    it("hasHydratedがfalseである", () => {
      expect(hydrationInitialState.hasHydrated).toBe(false);
    });

    it("setHasHydratedが関数である", () => {
      expect(typeof hydrationInitialState.setHasHydrated).toBe("function");
    });
  });

  describe("createHydrationActions", () => {
    it("setHasHydratedアクションを生成する", () => {
      const set = jest.fn();
      const actions = createHydrationActions(set);

      actions.setHasHydrated(true);
      expect(set).toHaveBeenCalledWith({ hasHydrated: true });

      actions.setHasHydrated(false);
      expect(set).toHaveBeenCalledWith({ hasHydrated: false });
    });
  });

  describe("createHydrationPersistConfig", () => {
    it("指定したstorageNameで設定を生成する", () => {
      const config = createHydrationPersistConfig("test-store");

      expect(config.name).toBe("test-store");
      expect(typeof config.onRehydrateStorage).toBe("function");
    });

    it("onRehydrateStorageがstateのsetHasHydratedを呼び出す", () => {
      const config = createHydrationPersistConfig<{
        hasHydrated: boolean;
        setHasHydrated: (state: boolean) => void;
      }>("test-store");

      const setHasHydrated = jest.fn();
      const state = { hasHydrated: false, setHasHydrated };

      const onRehydrate = config.onRehydrateStorage();
      onRehydrate(state);

      expect(setHasHydrated).toHaveBeenCalledWith(true);
    });

    it("onRehydrateStorageがundefined stateでもエラーを起こさない", () => {
      const config = createHydrationPersistConfig("test-store");

      const onRehydrate = config.onRehydrateStorage();
      // undefined state でもエラーが発生しないことを確認
      expect(() => onRehydrate(undefined)).not.toThrow();
    });
  });
});
