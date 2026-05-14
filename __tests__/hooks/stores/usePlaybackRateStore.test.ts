import { renderHook, act } from "@testing-library/react";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";

describe("hooks/stores/usePlaybackRateStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePlaybackRateStore());
    act(() => {
      result.current.setRate(1.0);
    });
  });

  it("初期状態ではrateが1.0である", () => {
    const { result } = renderHook(() => usePlaybackRateStore());
    expect(result.current.rate).toBe(1.0);
  });

  it("setRateで再生速度を変更できる", () => {
    const { result } = renderHook(() => usePlaybackRateStore());
    act(() => {
      result.current.setRate(1.5);
    });
    expect(result.current.rate).toBe(1.5);
  });

  it("再生速度を0.5に設定できる", () => {
    const { result } = renderHook(() => usePlaybackRateStore());
    act(() => {
      result.current.setRate(0.5);
    });
    expect(result.current.rate).toBe(0.5);
  });

  it("setRateで値を変更するとReact状態が更新される", () => {
    const { result } = renderHook(() => usePlaybackRateStore());
    act(() => {
      result.current.setRate(0.75);
    });
    expect(result.current.rate).toBe(0.75);

    act(() => {
      result.current.setRate(1.25);
    });
    expect(result.current.rate).toBe(1.25);
  });
});
