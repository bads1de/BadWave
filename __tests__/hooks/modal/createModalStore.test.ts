import { renderHook, act } from "@testing-library/react";
import { createModalStore } from "@/hooks/modal/createModalStore";

describe("hooks/modal/createModalStore", () => {
  it("should create a store with isOpen initially false", () => {
    const useStore = createModalStore();
    const { result } = renderHook(() => useStore());
    expect(result.current.isOpen).toBe(false);
  });

  it("should open the modal when onOpen is called", () => {
    const useStore = createModalStore();
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should close the modal when onClose is called", () => {
    const useStore = createModalStore();
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.onOpen();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.onClose();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should create independent stores", () => {
    const useStoreA = createModalStore();
    const useStoreB = createModalStore();
    const { result: resultA } = renderHook(() => useStoreA());
    const { result: resultB } = renderHook(() => useStoreB());

    expect(resultA.current.isOpen).toBe(false);
    expect(resultB.current.isOpen).toBe(false);

    act(() => {
      resultA.current.onOpen();
    });
    expect(resultA.current.isOpen).toBe(true);
    expect(resultB.current.isOpen).toBe(false);

    act(() => {
      resultB.current.onOpen();
    });
    expect(resultA.current.isOpen).toBe(true);
    expect(resultB.current.isOpen).toBe(true);

    act(() => {
      resultA.current.onClose();
    });
    expect(resultA.current.isOpen).toBe(false);
    expect(resultB.current.isOpen).toBe(true);
  });
});
