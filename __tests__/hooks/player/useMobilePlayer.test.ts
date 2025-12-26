import { renderHook, act } from "@testing-library/react";
import useMobilePlayer from "@/hooks/player/useMobilePlayer";

describe("useMobilePlayer", () => {
  it("should initialize with isMobilePlayer false", () => {
    const { result } = renderHook(() => useMobilePlayer());
    expect(result.current.isMobilePlayer).toBe(false);
  });

  it("should toggle isMobilePlayer state", () => {
    const { result } = renderHook(() => useMobilePlayer());

    act(() => {
      result.current.toggleMobilePlayer();
    });

    expect(result.current.isMobilePlayer).toBe(true);

    act(() => {
      result.current.toggleMobilePlayer();
    });

    expect(result.current.isMobilePlayer).toBe(false);
  });
});
