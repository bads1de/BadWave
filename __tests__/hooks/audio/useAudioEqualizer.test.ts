import { renderHook } from "@testing-library/react";
import useAudioEqualizer from "@/hooks/audio/useAudioEqualizer";
import useEqualizerStore from "@/hooks/stores/useEqualizerStore";
import { useRef } from "react";

// Mock store
jest.mock("@/hooks/stores/useEqualizerStore", () => ({
  __esModule: true,
  default: jest.fn(),
  EQ_BANDS: [{ freq: 60 }, { freq: 1000 }, { freq: 16000 }], // Mock reduced bands
}));

// Mock Web Audio API
class MockAudioContext {
  state = "suspended";
  createMediaElementSource = jest.fn(() => ({ connect: jest.fn() }));
  createBiquadFilter = jest.fn(() => ({ 
    connect: jest.fn(), 
    frequency: { value: 0 },
    gain: { value: 0 },
    Q: { value: 0 },
  }));
  destination = {};
  resume = jest.fn();
  close = jest.fn().mockResolvedValue(undefined);
}

global.AudioContext = MockAudioContext as any;

describe("hooks/audio/useAudioEqualizer", () => {
  let mockAudio: any;

  beforeEach(() => {
    mockAudio = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    
    // Default store state
    (useEqualizerStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({ isEnabled: true, bands: [{ gain: 5 }, { gain: 0 }, { gain: -5 }] });
    });
  });

  it("adds event listener on mount", () => {
    renderHook(() => {
      const ref = useRef(mockAudio);
      return useAudioEqualizer(ref);
    });
    expect(mockAudio.addEventListener).toHaveBeenCalledWith("play", expect.any(Function));
  });

  it("initializes audio graph on play", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    
    renderHook(() => {
      const ref = useRef(mockAudio);
      return useAudioEqualizer(ref);
    });

    const handlePlay = mockAudio.addEventListener.mock.calls[0][1];
    handlePlay(); // Simulate play

    expect(consoleSpy).toHaveBeenCalledWith("[useAudioEqualizer] Initialized successfully");
    consoleSpy.mockRestore();
  });
});
