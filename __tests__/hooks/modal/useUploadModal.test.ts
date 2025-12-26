import { renderHook, act } from "@testing-library/react";
import useUploadModal from "@/hooks/modal/useUploadModal";

describe("useUploadModal", () => {
  it("should return default values", () => {
    const { result } = renderHook(() => useUploadModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("should open the modal", () => {
    const { result } = renderHook(() => useUploadModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should close the modal", () => {
    const { result } = renderHook(() => useUploadModal());

    // Open first
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);

    // Then close
    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
