import { renderHook, act } from "@testing-library/react";
import useAudioPlayer from "@/hooks/audio/useAudioPlayer";
import usePlayer from "@/hooks/player/usePlayer";
import useAudioWaveStore from "@/hooks/audio/useAudioWave";
import { AudioEngine } from "@/libs/audio/AudioEngine";

// Mock AudioEngine
const mockAudio = {
  currentTime: 0,
  duration: 0,
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  src: "",
  volume: 1,
} as unknown as HTMLAudioElement;

const mockEngine = {
  isInitialized: false,
  initialize: jest.fn(),
  audio: mockAudio,
  resumeContext: jest.fn(),
};

jest.mock("@/libs/audio/AudioEngine", () => ({
  AudioEngine: {
    getInstance: jest.fn(() => mockEngine),
  },
}));

// Mock hooks
jest.mock("@/hooks/player/usePlayer", () => {
  const mockState = {
    isRepeating: false,
    isShuffling: false,
    toggleRepeat: jest.fn(),
    toggleShuffle: jest.fn(),
    getNextSongId: jest.fn(),
    getPreviousSongId: jest.fn(),
    setId: jest.fn(),
  };
  const fn = (selector: any) => (selector ? selector(mockState) : mockState);
  Object.assign(fn, mockState);
  return {
    __esModule: true,
    default: fn,
  };
});

jest.mock("@/hooks/audio/useAudioWave", () => {
  const mockState = {
    pause: jest.fn(),
  };
  const fn = (selector: any) => (selector ? selector(mockState) : mockState);
  return {
    __esModule: true,
    default: fn,
    globalAudioPlayerRef: {
      mainPlayerAudioRef: null,
      pauseMainPlayer: null,
      activePlayer: null,
    },
  };
});

// Mock icons
jest.mock("react-icons/bs", () => ({
  BsPauseFill: () => null,
  BsPlayFill: () => null,
}));
jest.mock("react-icons/hi2", () => ({
  HiSpeakerWave: () => null,
  HiSpeakerXMark: () => null,
}));

describe("useAudioPlayer", () => {
  const songUrl = "test-song.mp3";

  beforeEach(() => {
    jest.clearAllMocks();
    mockAudio.currentTime = 0;
    mockEngine.isInitialized = false;
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useAudioPlayer(songUrl));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
    expect(mockEngine.initialize).toHaveBeenCalled();
  });

  it("should toggle play state", () => {
    const { result } = renderHook(() => useAudioPlayer(songUrl));

    act(() => {
      result.current.handlePlay();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it("should seek to a specific time", () => {
    const { result } = renderHook(() => useAudioPlayer(songUrl));

    act(() => {
      result.current.handleSeek(30);
    });

    expect(mockAudio.currentTime).toBe(30);
    expect(result.current.currentTime).toBe(30);
  });

  it("should handle next song logic", () => {
    const player = usePlayer as any;
    player.getNextSongId.mockReturnValue("next-id");

    const { result } = renderHook(() => useAudioPlayer(songUrl));

    act(() => {
      result.current.onPlayNext();
    });

    expect(player.setId).toHaveBeenCalledWith("next-id");
  });

  it("should format time correctly", () => {
    const { result } = renderHook(() => useAudioPlayer(songUrl));

    act(() => {
      result.current.handleSeek(65);
    });

    expect(result.current.formattedCurrentTime).toBe("1:05");
  });
});