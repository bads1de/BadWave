/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import useAudioEqualizer from "@/hooks/audio/useAudioEqualizer";
import useEqualizerStore from "@/hooks/stores/useEqualizerStore";
import { AudioEngine } from "@/libs/audio/AudioEngine";

// Mock AudioEngine
const mockFilter = { gain: { value: 0 } };
const mockEngine = {
  isInitialized: false,
  filters: [mockFilter, mockFilter, mockFilter, mockFilter, mockFilter, mockFilter],
};

jest.mock("@/libs/audio/AudioEngine", () => ({
  AudioEngine: {
    getInstance: jest.fn(() => mockEngine),
  },
}));

describe("hooks/audio/useAudioEqualizer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEngine.isInitialized = true; // Assume initialized by useAudioPlayer
    mockFilter.gain.value = 0;

    act(() => {
      useEqualizerStore.setState({ isEnabled: true, bands: Array(6).fill({ freq: 100, gain: 5 }) });
    });
  });

  it("applies equalizer settings when initialized", () => {
    renderHook(() => useAudioEqualizer());

    expect(mockFilter.gain.value).toBe(5);
  });

  it("does not crash if engine is not initialized", () => {
    mockEngine.isInitialized = false;
    renderHook(() => useAudioEqualizer());
    expect(mockFilter.gain.value).toBe(0); // No change
  });

  it("disables equalizer (sets gain to 0)", () => {
    act(() => {
        useEqualizerStore.setState({ isEnabled: false });
    });

    renderHook(() => useAudioEqualizer());

    expect(mockFilter.gain.value).toBe(0);
  });
});
