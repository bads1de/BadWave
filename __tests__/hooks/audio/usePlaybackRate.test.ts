import { renderHook } from "@testing-library/react";
import usePlaybackRate from "@/hooks/audio/usePlaybackRate";
import usePlaybackRateStore from "@/hooks/stores/usePlaybackRateStore";
import { useRef } from "react";

jest.mock("@/hooks/stores/usePlaybackRateStore");

describe("hooks/audio/usePlaybackRate", () => {
  let mockAudio: any;

  beforeEach(() => {
    mockAudio = {
      playbackRate: 1,
      preservesPitch: true,
      mozPreservesPitch: true,
      webkitPreservesPitch: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    
    // Default store state
    (usePlaybackRateStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { rate: 1.0, isSlowedReverb: false };
      return selector(state);
    });
  });

  it("sets playback rate on mount", () => {
    const { result } = renderHook(() => {
      const ref = useRef(mockAudio);
      return usePlaybackRate(ref);
    });

    expect(mockAudio.playbackRate).toBe(1.0);
  });

  it("updates rate when store changes", () => {
    (usePlaybackRateStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { rate: 1.5, isSlowedReverb: false };
      return selector(state);
    });

    renderHook(() => {
      const ref = useRef(mockAudio);
      return usePlaybackRate(ref);
    });

    expect(mockAudio.playbackRate).toBe(1.5);
    expect(mockAudio.preservesPitch).toBe(true);
  });

  it("handles slowed + reverb mode", () => {
    (usePlaybackRateStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { rate: 1.0, isSlowedReverb: true };
      return selector(state);
    });

    renderHook(() => {
      const ref = useRef(mockAudio);
      return usePlaybackRate(ref);
    });

    expect(mockAudio.playbackRate).toBe(0.85);
    expect(mockAudio.preservesPitch).toBe(false);
  });

  it("re-applies settings on durationchange event", () => {
    (usePlaybackRateStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { rate: 1.25, isSlowedReverb: false };
      return selector(state);
    });

    renderHook(() => {
      const ref = useRef(mockAudio);
      return usePlaybackRate(ref);
    });

    // Check if event listener is added
    expect(mockAudio.addEventListener).toHaveBeenCalledWith("durationchange", expect.any(Function));
    
    // Simulate event trigger
    const handler = mockAudio.addEventListener.mock.calls[0][1];
    
    // Reset properties to verify handler effect
    mockAudio.playbackRate = 1.0;
    
    handler();
    
    expect(mockAudio.playbackRate).toBe(1.25);
  });
});
