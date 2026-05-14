import { renderHook, act } from "@testing-library/react";
import useEffectStore from "@/hooks/stores/useEffectStore";

describe("hooks/stores/useEffectStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useEffectStore());
    act(() => {
      if (result.current.isSlowedReverb) result.current.toggleSlowedReverb();
      if (result.current.is8DAudioEnabled) result.current.toggle8DAudio();
      if (result.current.isRetroEnabled) result.current.toggleRetro();
      if (result.current.isBassBoostEnabled) result.current.toggleBassBoost();
      result.current.setRotationSpeed("medium");
    });
  });

  describe("Slowed+Reverb", () => {
    it("初期状態ではisSlowedReverbがfalseである", () => {
      const { result } = renderHook(() => useEffectStore());
      expect(result.current.isSlowedReverb).toBe(false);
    });

    it("toggleSlowedReverbで値が切り替わる", () => {
      const { result } = renderHook(() => useEffectStore());
      act(() => {
        result.current.toggleSlowedReverb();
      });
      expect(result.current.isSlowedReverb).toBe(true);

      act(() => {
        result.current.toggleSlowedReverb();
      });
      expect(result.current.isSlowedReverb).toBe(false);
    });
  });

  describe("8D Audio", () => {
    it("初期状態ではis8DAudioEnabledがfalseである", () => {
      const { result } = renderHook(() => useEffectStore());
      expect(result.current.is8DAudioEnabled).toBe(false);
    });

    it("toggle8DAudioで値が切り替わる", () => {
      const { result } = renderHook(() => useEffectStore());
      act(() => {
        result.current.toggle8DAudio();
      });
      expect(result.current.is8DAudioEnabled).toBe(true);
    });

    it("rotationSpeedを変更できる", () => {
      const { result } = renderHook(() => useEffectStore());
      act(() => {
        result.current.setRotationSpeed("slow");
      });
      expect(result.current.rotationSpeed).toBe("slow");

      act(() => {
        result.current.setRotationSpeed("fast");
      });
      expect(result.current.rotationSpeed).toBe("fast");
    });
  });

  describe("Retro Mode", () => {
    it("初期状態ではisRetroEnabledがfalseである", () => {
      const { result } = renderHook(() => useEffectStore());
      expect(result.current.isRetroEnabled).toBe(false);
    });

    it("toggleRetroで値が切り替わる", () => {
      const { result } = renderHook(() => useEffectStore());
      act(() => {
        result.current.toggleRetro();
      });
      expect(result.current.isRetroEnabled).toBe(true);
    });
  });

  describe("Bass Boost", () => {
    it("初期状態ではisBassBoostEnabledがfalseである", () => {
      const { result } = renderHook(() => useEffectStore());
      expect(result.current.isBassBoostEnabled).toBe(false);
    });

    it("toggleBassBoostで値が切り替わる", () => {
      const { result } = renderHook(() => useEffectStore());
      act(() => {
        result.current.toggleBassBoost();
      });
      expect(result.current.isBassBoostEnabled).toBe(true);
    });
  });
});
