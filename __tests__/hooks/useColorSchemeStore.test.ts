import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";
import {
  colorSchemes,
  getColorSchemeById,
  DEFAULT_COLOR_SCHEME_ID,
} from "@/constants/colorSchemes";
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

describe("useColorSchemeStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // ストアの状態をリセット
    useColorSchemeStore.setState({ colorSchemeId: DEFAULT_COLOR_SCHEME_ID });
  });

  it("デフォルトのカラースキームIDがvioletであること", () => {
    const { result } = renderHook(() => useColorSchemeStore());
    expect(result.current.colorSchemeId).toBe("violet");
  });

  it("getColorSchemeがデフォルトのカラースキームを返すこと", () => {
    const { result } = renderHook(() => useColorSchemeStore());
    const colorScheme = result.current.getColorScheme();
    expect(colorScheme.id).toBe("violet");
    expect(colorScheme.name).toBe("バイオレット");
  });

  it("setColorSchemeでカラースキームを変更できること", () => {
    const { result } = renderHook(() => useColorSchemeStore());

    act(() => {
      result.current.setColorScheme("emerald");
    });

    expect(result.current.colorSchemeId).toBe("emerald");
    expect(result.current.getColorScheme().name).toBe("エメラルド");
  });

  it("すべてのカラースキームを取得できること", () => {
    expect(colorSchemes).toHaveLength(6);
    expect(colorSchemes.map((s) => s.id)).toEqual([
      "violet",
      "emerald",
      "rose",
      "amber",
      "sky",
      "monochrome",
    ]);
  });

  it("getColorSchemeByIdが正しいスキームを返すこと", () => {
    const scheme = getColorSchemeById("rose");
    expect(scheme.id).toBe("rose");
    expect(scheme.name).toBe("ローズ");
  });

  it("getColorSchemeByIdで存在しないIDの場合デフォルトを返すこと", () => {
    const scheme = getColorSchemeById("nonexistent");
    expect(scheme.id).toBe("violet");
  });
});
