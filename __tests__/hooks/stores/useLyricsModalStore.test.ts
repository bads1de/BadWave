import { renderHook, act } from "@testing-library/react";
import useLyricsModalStore from "@/hooks/stores/useLyricsModalStore";

describe("hooks/stores/useLyricsModalStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useLyricsModalStore());
    act(() => {
      result.current.closeModal();
    });
  });

  it("初期状態ではモーダルが閉じている", () => {
    const { result } = renderHook(() => useLyricsModalStore());
    expect(result.current.isOpen).toBe(false);
  });

  it("openModalでモーダルが開く", () => {
    const { result } = renderHook(() => useLyricsModalStore());
    act(() => {
      result.current.openModal();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("closeModalでモーダルが閉じる", () => {
    const { result } = renderHook(() => useLyricsModalStore());
    act(() => {
      result.current.openModal();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
