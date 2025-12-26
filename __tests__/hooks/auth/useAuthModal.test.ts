import { renderHook, act } from "@testing-library/react";
import useAuthModal from "@/hooks/auth/useAuthModal";

describe("useAuthModal", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthModal());
    act(() => {
      result.current.onClose();
    });
  });

  it("should return default values", () => {
    const { result } = renderHook(() => useAuthModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("should open the modal", () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should close the modal", () => {
    const { result } = renderHook(() => useAuthModal());

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
