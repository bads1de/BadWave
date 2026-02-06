import { renderHook, act } from "@testing-library/react";
import { useAudioControl } from "@/hooks/audio/useAudioControl";
import { globalAudioPlayerRef } from "@/hooks/audio/useAudioWave";

describe("useAudioControl", () => {
  beforeEach(() => {
    // Reset globalAudioPlayerRef before each test
    globalAudioPlayerRef.activePlayer = null;
    globalAudioPlayerRef.mainPlayerAudioRef = null;
    globalAudioPlayerRef.pauseMainPlayer = null;
  });

  it("should set and get active player", () => {
    const { result } = renderHook(() => useAudioControl());

    expect(result.current.getActivePlayer()).toBeNull();

    act(() => {
      result.current.setActivePlayer("main");
    });
    expect(result.current.getActivePlayer()).toBe("main");

    act(() => {
      result.current.setActivePlayer("wave");
    });
    expect(result.current.getActivePlayer()).toBe("wave");

    act(() => {
      result.current.setActivePlayer(null);
    });
    expect(result.current.getActivePlayer()).toBeNull();
  });

  it("should stop main player when stopMainPlayer is called", () => {
    const mockPause = jest.fn();
    const mockAudioPause = jest.fn();
    
    globalAudioPlayerRef.pauseMainPlayer = mockPause;
    globalAudioPlayerRef.mainPlayerAudioRef = {
      pause: mockAudioPause,
    } as unknown as HTMLAudioElement;

    const { result } = renderHook(() => useAudioControl());

    act(() => {
      result.current.stopMainPlayer();
    });

    expect(mockPause).toHaveBeenCalled();
    expect(mockAudioPause).toHaveBeenCalled();
  });

  it("should not crash if global refs are null when stopMainPlayer is called", () => {
    const { result } = renderHook(() => useAudioControl());

    expect(() => {
      act(() => {
        result.current.stopMainPlayer();
      });
    }).not.toThrow();
  });
});
