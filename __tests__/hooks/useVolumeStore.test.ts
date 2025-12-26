import useVolumeStore, {
  DEFAULT_DESKTOP_VOLUME,
} from "@/hooks/stores/useVolumeStore";
import { act, renderHook } from "@testing-library/react";

// Zustand の persist ミドルウェアをモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useVolumeStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // ストアの状態をリセット
    useVolumeStore.setState({ volume: DEFAULT_DESKTOP_VOLUME });
  });

  it("デフォルトのボリュームが0.1であること", () => {
    const { result } = renderHook(() => useVolumeStore());
    expect(result.current.volume).toBe(0.1);
  });

  it("setVolumeでボリュームを変更できること", () => {
    const { result } = renderHook(() => useVolumeStore());

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(result.current.volume).toBe(0.5);
  });

  it("setVolumeで0未満の値を設定すると0になること", () => {
    const { result } = renderHook(() => useVolumeStore());

    act(() => {
      result.current.setVolume(-0.5);
    });

    expect(result.current.volume).toBe(0);
  });

  it("setVolumeで1を超える値を設定すると1になること", () => {
    const { result } = renderHook(() => useVolumeStore());

    act(() => {
      result.current.setVolume(1.5);
    });

    expect(result.current.volume).toBe(1);
  });

  it("setVolumeでミュート（0）に設定できること", () => {
    const { result } = renderHook(() => useVolumeStore());

    act(() => {
      result.current.setVolume(0);
    });

    expect(result.current.volume).toBe(0);
  });

  it("setVolumeで最大値（1）に設定できること", () => {
    const { result } = renderHook(() => useVolumeStore());

    act(() => {
      result.current.setVolume(1);
    });

    expect(result.current.volume).toBe(1);
  });

  it("DEFAULT_DESKTOP_VOLUMEが0.1であること", () => {
    expect(DEFAULT_DESKTOP_VOLUME).toBe(0.1);
  });
});
