import { renderHook, act } from "@testing-library/react";
import useLyricsStore from "@/hooks/stores/useLyricsStore";

describe("hooks/stores/useLyricsStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useLyricsStore());
    act(() => {
      if (result.current.showLyrics) {
        result.current.toggleLyrics();
      }
    });
  });

  it("初期状態ではshowLyricsがfalseである", () => {
    const { result } = renderHook(() => useLyricsStore());
    expect(result.current.showLyrics).toBe(false);
  });

  it("toggleLyricsでshowLyricsが切り替わる", () => {
    const { result } = renderHook(() => useLyricsStore());
    act(() => {
      result.current.toggleLyrics();
    });
    expect(result.current.showLyrics).toBe(true);

    act(() => {
      result.current.toggleLyrics();
    });
    expect(result.current.showLyrics).toBe(false);
  });
});
