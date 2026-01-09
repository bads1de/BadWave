import { renderHook, act } from "@testing-library/react";
import useAudioWaveStore from "@/hooks/audio/useAudioWave";

// Mock Web Audio API classes
class MockAudioContext {
  state = "suspended";
  createAnalyser = jest.fn(() => ({
    connect: jest.fn(),
    fftSize: 2048,
  }));
  createMediaElementSource = jest.fn(() => ({
    connect: jest.fn(),
  }));
  destination = {};
  resume = jest.fn().mockResolvedValue(undefined);
  close = jest.fn().mockResolvedValue(undefined);
}

class MockAudio {
  crossOrigin = "";
  volume = 1;
  src = "";
  currentTime = 0;
  duration = 0;
  readyState = 0; // HAVE_NOTHING
  
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  play = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn();
  load = jest.fn();

  constructor(url: string) {
    this.src = url;
  }
}

global.AudioContext = MockAudioContext as any;
global.window.AudioContext = MockAudioContext as any;
global.Audio = MockAudio as any;

describe("hooks/audio/useAudioWave", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAudioWaveStore());
    act(() => {
      result.current.cleanup();
    });
  });

  it("initializes audio correctly", async () => {
    const { result } = renderHook(() => useAudioWaveStore());

    await act(async () => {
      await result.current.initializeAudio("test.mp3", "song-1");
    });

    expect(result.current.audioContext).toBeInstanceOf(MockAudioContext);
    expect(result.current.audioElement).toBeInstanceOf(MockAudio);
    expect(result.current.currentSongId).toBe("song-1");
    expect(result.current.audioUrl).toBe("test.mp3");
  });

  it("plays audio", async () => {
    const { result } = renderHook(() => useAudioWaveStore());

    await act(async () => {
      await result.current.initializeAudio("test.mp3", "song-1");
    });

    // Mock readyState to allow play
    if (result.current.audioElement) {
      (result.current.audioElement as any).readyState = 4; // HAVE_ENOUGH_DATA
    }

    await act(async () => {
      await result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.audioElement?.play).toHaveBeenCalled();
  });

  it("pauses audio", async () => {
    const { result } = renderHook(() => useAudioWaveStore());

    await act(async () => {
      await result.current.initializeAudio("test.mp3", "song-1");
      // Set playing state manually or via play
      result.current.setIsPlaying(true);
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.audioElement?.pause).toHaveBeenCalled();
  });

  it("seeks audio", async () => {
    const { result } = renderHook(() => useAudioWaveStore());

    await act(async () => {
      await result.current.initializeAudio("test.mp3", "song-1");
    });

    act(() => {
      result.current.seek(30);
    });

    expect(result.current.currentTime).toBe(30);
    expect(result.current.audioElement?.currentTime).toBe(30);
  });
});
