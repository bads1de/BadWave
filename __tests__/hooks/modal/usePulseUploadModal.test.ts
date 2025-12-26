import { renderHook, act } from "@testing-library/react";
import usePulseUploadModal from "@/hooks/modal/usePulseUploadModal";

describe("usePulseUploadModal", () => {
  // Reset state before each test if state implies singleton?
  // Zustland stores are global singletons in module scope.
  // Ideally we should reset them, but for simple toggle tests, just ensure it starts closed or force close.
  // However, create() stores are persistent across tests in JSDOM unless reset.
  // But JSDOM environment usually resets modules? No, Jest requires `jest.resetModules()` for that.

  beforeEach(() => {
    const { result } = renderHook(() => usePulseUploadModal());
    act(() => {
      result.current.onClose();
    });
  });

  it("should return default values", () => {
    const { result } = renderHook(() => usePulseUploadModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("should open the modal", () => {
    const { result } = renderHook(() => usePulseUploadModal());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should close the modal", () => {
    const { result } = renderHook(() => usePulseUploadModal());

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
