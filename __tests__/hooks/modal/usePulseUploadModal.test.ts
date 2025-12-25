import { renderHook, act } from "@testing-library/react";
import usePulseUploadModal from "@/hooks/modal/usePulseUploadModal";

describe("usePulseUploadModal", () => {
  beforeEach(() => {
    // Zustandのストアをリセット
    usePulseUploadModal.setState({ isOpen: false });
  });

  it("初期状態でisOpenがfalseであること", () => {
    const { result } = renderHook(() => usePulseUploadModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("onOpenを呼び出すとisOpenがtrueになること", () => {
    const { result } = renderHook(() => usePulseUploadModal());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("onCloseを呼び出すとisOpenがfalseになること", () => {
    const { result } = renderHook(() => usePulseUploadModal());

    // まずモーダルを開く
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    // モーダルを閉じる
    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("複数のコンポーネント間で状態が共有されること", () => {
    const { result: result1 } = renderHook(() => usePulseUploadModal());
    const { result: result2 } = renderHook(() => usePulseUploadModal());

    // 一方でモーダルを開く
    act(() => {
      result1.current.onOpen();
    });

    // 両方のフックで状態が更新されていることを確認
    expect(result1.current.isOpen).toBe(true);
    expect(result2.current.isOpen).toBe(true);

    // もう一方でモーダルを閉じる
    act(() => {
      result2.current.onClose();
    });

    // 両方のフックで状態が更新されていることを確認
    expect(result1.current.isOpen).toBe(false);
    expect(result2.current.isOpen).toBe(false);
  });
});
