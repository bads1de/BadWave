import { renderHook, act } from "@testing-library/react";
import useSpatialStore from "@/hooks/stores/useSpatialStore";

describe("hooks/stores/useSpatialStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSpatialStore());
    act(() => {
      result.current.setHasHydrated(false);
      if (result.current.isSpatialEnabled) {
        result.current.toggleSpatialEnabled();
      }
    });
  });

  it("初期状態ではisSpatialEnabledがfalseである", () => {
    const { result } = renderHook(() => useSpatialStore());
    expect(result.current.isSpatialEnabled).toBe(false);
  });

  it("toggleSpatialEnabledで値が切り替わる", () => {
    const { result } = renderHook(() => useSpatialStore());
    act(() => {
      result.current.toggleSpatialEnabled();
    });
    expect(result.current.isSpatialEnabled).toBe(true);

    act(() => {
      result.current.toggleSpatialEnabled();
    });
    expect(result.current.isSpatialEnabled).toBe(false);
  });

  it("hasHydratedの初期値がfalseである", () => {
    const { result } = renderHook(() => useSpatialStore());
    expect(result.current.hasHydrated).toBe(false);
  });

  it("setHasHydratedでhydration状態を変更できる", () => {
    const { result } = renderHook(() => useSpatialStore());
    act(() => {
      result.current.setHasHydrated(true);
    });
    expect(result.current.hasHydrated).toBe(true);
  });
});
