import { renderHook, act } from "@testing-library/react";
import useVolumeStore, { DEFAULT_DESKTOP_VOLUME } from "@/hooks/stores/useVolumeStore";

describe("hooks/stores/useVolumeStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useVolumeStore());
    act(() => {
      result.current.setVolume(DEFAULT_DESKTOP_VOLUME);
    });
  });

  it("initializes with default volume", () => {
    const { result } = renderHook(() => useVolumeStore());
    expect(result.current.volume).toBe(DEFAULT_DESKTOP_VOLUME);
  });

  it("updates volume within range", () => {
    const { result } = renderHook(() => useVolumeStore());
    
    act(() => {
      result.current.setVolume(0.5);
    });
    expect(result.current.volume).toBe(0.5);

    // Clamping test
    act(() => {
      result.current.setVolume(1.5);
    });
    expect(result.current.volume).toBe(1);

    act(() => {
      result.current.setVolume(-0.5);
    });
    expect(result.current.volume).toBe(0);
  });
});
