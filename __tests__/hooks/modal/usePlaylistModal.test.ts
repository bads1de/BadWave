import { renderHook, act } from "@testing-library/react";
import usePlaylistModal from "@/hooks/modal/usePlaylistModal";

describe("hooks/modal/usePlaylistModal", () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePlaylistModal());
    act(() => {
      result.current.onClose();
    });
  });

  it("初期状態ではモーダルが閉じている", () => {
    const { result } = renderHook(() => usePlaylistModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("onOpenでモーダルが開く", () => {
    const { result } = renderHook(() => usePlaylistModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("onCloseでモーダルが閉じる", () => {
    const { result } = renderHook(() => usePlaylistModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
