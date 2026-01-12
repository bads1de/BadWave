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
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Default store state
    (usePlaybackRateStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        const state = { rate: 1.0 };
        return selector(state);
      }
    );
  });

  it("sets playback rate on mount", () => {
    renderHook(() => {
      const ref = useRef(mockAudio);
      return usePlaybackRate(ref);
    });

    expect(mockAudio.playbackRate).toBe(1.0);
  });

  it("updates rate when store changes", () => {
    (usePlaybackRateStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        const state = { rate: 1.5 };
        return selector(state);
      }
    );

    renderHook(() => {
      const ref = useRef(mockAudio);
      return usePlaybackRate(ref);
    });

    expect(mockAudio.playbackRate).toBe(1.5);
  });

  it("re-applies settings on durationchange event", () => {
    (usePlaybackRateStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        const state = { rate: 1.25 };
        return selector(state);
      }
    );

    renderHook(() => {
      const ref = useRef(mockAudio);
      return usePlaybackRate(ref);
    });

    // Check if event listener is added
    expect(mockAudio.addEventListener).toHaveBeenCalledWith(
      "durationchange",
      expect.any(Function)
    );

    // Simulate event trigger
    const handler = mockAudio.addEventListener.mock.calls[0][1];

    // Reset properties to verify handler effect
    mockAudio.playbackRate = 1.0;

    handler();

    expect(mockAudio.playbackRate).toBe(1.25);
  });
});
