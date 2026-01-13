import { renderHook } from "@testing-library/react";
import useMediaSession from "@/hooks/player/useMediaSession";
import { Song } from "@/types";

// Mock Song object
const mockSong: Song = {
  id: "1",
  title: "Test Song",
  author: "Test Artist",
  song_path: "path/to/song.mp3",
  image_path: "path/to/image.png",
  user_id: "user1",
  created_at: "2023-01-01",
};

describe("useMediaSession", () => {
  let originalMediaSession: any;
  let mockSetActionHandler: jest.Mock;

  beforeAll(() => {
    originalMediaSession = navigator.mediaSession;
    mockSetActionHandler = jest.fn();

    Object.defineProperty(navigator, "mediaSession", {
      writable: true,
      value: {
        metadata: null,
        playbackState: "none",
        setActionHandler: mockSetActionHandler,
      },
    });

    // Mock MediaMetadata
    (global as any).MediaMetadata = jest.fn((metadata) => metadata);
  });

  afterAll(() => {
    Object.defineProperty(navigator, "mediaSession", {
      writable: true,
      value: originalMediaSession,
    });
  });

  beforeEach(() => {
    mockSetActionHandler.mockClear();
    if (navigator.mediaSession) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
  });

  it("updates metadata when song changes", () => {
    renderHook(() =>
      useMediaSession({
        song: mockSong,
        isPlaying: false,
        onPlay: jest.fn(),
        onPause: jest.fn(),
        onPlayNext: jest.fn(),
        onPlayPrevious: jest.fn(),
      })
    );

    expect(navigator.mediaSession?.metadata).toEqual({
      title: mockSong.title,
      artist: mockSong.author,
      artwork: expect.any(Array),
    });
  });

  it("updates playback state when isPlaying changes", () => {
    const { rerender } = renderHook(
      ({ isPlaying }) =>
        useMediaSession({
          song: mockSong,
          isPlaying,
          onPlay: jest.fn(),
          onPause: jest.fn(),
          onPlayNext: jest.fn(),
          onPlayPrevious: jest.fn(),
        }),
      { initialProps: { isPlaying: false } }
    );

    expect(navigator.mediaSession?.playbackState).toBe("paused");

    rerender({ isPlaying: true });
    expect(navigator.mediaSession?.playbackState).toBe("playing");
  });

  it("sets action handlers", () => {
    const onPlay = jest.fn();
    const onPause = jest.fn();
    const onPlayNext = jest.fn();
    const onPlayPrevious = jest.fn();
    const onSeek = jest.fn();

    renderHook(() =>
      useMediaSession({
        song: mockSong,
        isPlaying: false,
        onPlay,
        onPause,
        onPlayNext,
        onPlayPrevious,
        onSeek,
      })
    );

    expect(mockSetActionHandler).toHaveBeenCalledWith("play", onPlay);
    expect(mockSetActionHandler).toHaveBeenCalledWith("pause", onPause);
    expect(mockSetActionHandler).toHaveBeenCalledWith(
      "previoustrack",
      onPlayPrevious
    );
    expect(mockSetActionHandler).toHaveBeenCalledWith("nexttrack", onPlayNext);
    expect(mockSetActionHandler).toHaveBeenCalledWith(
      "seekto",
      expect.any(Function)
    );
  });
});
