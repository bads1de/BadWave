/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import usePlaybackRate from "@/hooks/audio/usePlaybackRate";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";
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