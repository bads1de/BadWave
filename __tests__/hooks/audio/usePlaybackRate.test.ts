/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import usePlaybackRate from "@/hooks/audio/usePlaybackRate";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";
import useNightCoreStore from "@/hooks/stores/useNightCoreStore";
import { AudioEngine } from "@/libs/audio/AudioEngine";

// Mock AudioEngine
const mockAudio = {
  playbackRate: 1,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

jest.mock("@/libs/audio/AudioEngine", () => ({
  AudioEngine: {
    getInstance: jest.fn(() => ({
      audio: mockAudio,
    })),
  },
}));

describe("hooks/audio/usePlaybackRate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudio.playbackRate = 1;
    act(() => {
      usePlaybackRateStore.setState({ rate: 1.0 });
      useNightCoreStore.setState({ isEnabled: false });
    });
  });

  it("sets playback rate on mount", () => {
    renderHook(() => usePlaybackRate());
    expect(mockAudio.playbackRate).toBe(1.0);
  });

  it("updates rate when store changes", () => {
    renderHook(() => usePlaybackRate());

    act(() => {
      usePlaybackRateStore.setState({ rate: 1.5 });
    });

    expect(mockAudio.playbackRate).toBe(1.5);
  });

  it("applies NightCore rate of 1.35 when NightCore is enabled", () => {
    act(() => {
      useNightCoreStore.setState({ isEnabled: true });
    });

    renderHook(() => usePlaybackRate());
    expect(mockAudio.playbackRate).toBe(1.35);
  });

  it("ignores store rate when NightCore is enabled", () => {
    act(() => {
      usePlaybackRateStore.setState({ rate: 0.9 });
      useNightCoreStore.setState({ isEnabled: true });
    });

    renderHook(() => usePlaybackRate());
    expect(mockAudio.playbackRate).toBe(1.35);
  });

  it("reverts to store rate when NightCore is disabled", () => {
    act(() => {
      usePlaybackRateStore.setState({ rate: 1.1 });
      useNightCoreStore.setState({ isEnabled: true });
    });

    const { result } = renderHook(() => usePlaybackRate());

    expect(mockAudio.playbackRate).toBe(1.35);

    act(() => {
      useNightCoreStore.setState({ isEnabled: false });
    });

    expect(mockAudio.playbackRate).toBe(1.1);
  });

  it("re-applies settings on durationchange event", () => {
    act(() => {
        usePlaybackRateStore.setState({ rate: 1.25 });
    });

    renderHook(() => usePlaybackRate());

    expect(mockAudio.addEventListener).toHaveBeenCalledWith("durationchange", expect.any(Function));
    
    const handler = mockAudio.addEventListener.mock.calls[0][1];
    
    // Reset properties to verify handler effect
    mockAudio.playbackRate = 1.0;
    
    act(() => {
        handler();
    });
    
    expect(mockAudio.playbackRate).toBe(1.25);
  });
});