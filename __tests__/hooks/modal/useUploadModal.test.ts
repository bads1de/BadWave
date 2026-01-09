import { renderHook, act } from "@testing-library/react";
import useUploadModal from "@/hooks/modal/useUploadModal";

describe("hooks/modal/useUploadModal", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useUploadModal());
    act(() => {
      result.current.onClose();
    });
  });

  it("should initialize as closed", () => {
    const { result } = renderHook(() => useUploadModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("should open modal", () => {
    const { result } = renderHook(() => useUploadModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should close modal", () => {
    const { result } = renderHook(() => useUploadModal());
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