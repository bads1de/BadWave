import { renderHook, act } from "@testing-library/react";
import useSpotLightUploadModal from "@/hooks/modal/useSpotLightUpload";

describe("hooks/modal/useSpotLightUpload", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSpotLightUploadModal());
    act(() => {
      result.current.onClose();
    });
  });

  it("初期状態ではモーダルが閉じている", () => {
    const { result } = renderHook(() => useSpotLightUploadModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("onOpenでモーダルが開く", () => {
    const { result } = renderHook(() => useSpotLightUploadModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("onCloseでモーダルが閉じる", () => {
    const { result } = renderHook(() => useSpotLightUploadModal());
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
