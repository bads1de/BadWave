import useNightCoreStore from "@/hooks/stores/useNightCoreStore";

describe("hooks/stores/useNightCoreStore", () => {
  beforeEach(() => {
    useNightCoreStore.setState({ isEnabled: false, hasHydrated: false });
  });

  it("初期状態でisEnabledがfalseである", () => {
    const state = useNightCoreStore.getState();
    expect(state.isEnabled).toBe(false);
  });

  it("toggleでisEnabledを反転させる", () => {
    const { toggle } = useNightCoreStore.getState();
    toggle();
    expect(useNightCoreStore.getState().isEnabled).toBe(true);

    toggle();
    expect(useNightCoreStore.getState().isEnabled).toBe(false);
  });

  it("setEnabledでisEnabledを設定できる", () => {
    const { setEnabled } = useNightCoreStore.getState();
    setEnabled(true);
    expect(useNightCoreStore.getState().isEnabled).toBe(true);

    setEnabled(false);
    expect(useNightCoreStore.getState().isEnabled).toBe(false);
  });

  it("hasHydratedの状態を管理できる", () => {
    const { setHasHydrated } = useNightCoreStore.getState();
    setHasHydrated(true);
    expect(useNightCoreStore.getState().hasHydrated).toBe(true);
  });
});
