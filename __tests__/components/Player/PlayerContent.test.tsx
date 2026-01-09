import { render, screen, fireEvent } from "@testing-library/react";
import PlayerContent from "@/components/Player/PlayerContent";
import useAudioPlayer from "@/hooks/audio/useAudioPlayer";
import { Song } from "@/types";

// Mock hooks
jest.mock("@/hooks/audio/useAudioPlayer");
jest.mock("@/hooks/audio/useAudioEqualizer", () => jest.fn());
jest.mock("@/hooks/audio/usePlaybackRate", () => jest.fn());

// Mock child components
jest.mock("@/components/Player/DesktopPlayer", () => {
  return {
    __esModule: true,
    default: ({ handlePlay, isPlaying }: any) => {
      const React = require("react");
      return React.createElement(
        "div", 
        { "data-testid": "desktop-player" },
        React.createElement("button", { 
          onClick: handlePlay, 
          "aria-label": isPlaying ? "Pause" : "Play" 
        }, isPlaying ? "Pause" : "Play")
      );
    },
  };
});

jest.mock("@/components/Player/MobilePlayer", () => {
  return {
    __esModule: true,
    default: ({ handlePlay, isPlaying }: any) => {
      const React = require("react");
      return React.createElement(
        "div", 
        { "data-testid": "mobile-player" },
         React.createElement("button", { 
          onClick: handlePlay,
          "aria-label": isPlaying ? "Pause" : "Play" 
        }, isPlaying ? "Pause" : "Play")
      );
    },
  };
});

describe("components/Player/PlayerContent", () => {
  const mockSong: Song = {
    id: "song-1",
    user_id: "user-1",
    author: "Test Author",
    title: "Test Song",
    song_path: "path.mp3",
    image_path: "image.jpg",
    genre: "Pop",
    count: "100",
    like_count: "50",
    created_at: "2024-01-01",
  };

  const mockHandlePlay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAudioPlayer as jest.Mock).mockReturnValue({
      formattedCurrentTime: "0:00",
      formattedDuration: "3:00",
      audioRef: { current: null },
      currentTime: 0,
      duration: 180,
      isPlaying: false,
      isRepeating: false,
      isShuffling: false,
      handlePlay: mockHandlePlay,
      handleSeek: jest.fn(),
      onPlayNext: jest.fn(),
      onPlayPrevious: jest.fn(),
      toggleRepeat: jest.fn(),
      toggleShuffle: jest.fn(),
    });
  });

  it("renders desktop player by default", () => {
    render(
      <PlayerContent 
        song={mockSong} 
        isMobilePlayer={false} 
        toggleMobilePlayer={jest.fn()} 
        playlists={[]}
      />
    );
    expect(screen.getByTestId("desktop-player")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-player")).not.toBeInTheDocument();
  });

  it("renders mobile player when specified", () => {
    render(
      <PlayerContent 
        song={mockSong} 
        isMobilePlayer={true} 
        toggleMobilePlayer={jest.fn()} 
        playlists={[]}
      />
    );
    expect(screen.getByTestId("mobile-player")).toBeInTheDocument();
    expect(screen.queryByTestId("desktop-player")).not.toBeInTheDocument();
  });

  it("handles play/pause toggle", () => {
    render(
      <PlayerContent 
        song={mockSong} 
        isMobilePlayer={false} 
        toggleMobilePlayer={jest.fn()} 
        playlists={[]}
      />
    );
    
    // We mocked DesktopPlayer to render a button that calls handlePlay
    const playButton = screen.getByRole("button", { name: "Play" });
    fireEvent.click(playButton);

    expect(mockHandlePlay).toHaveBeenCalled();
  });

  it("reflects playing state", () => {
    (useAudioPlayer as jest.Mock).mockReturnValue({
      ...((useAudioPlayer as jest.Mock)()), // current mock return
      isPlaying: true,
    });

    render(
      <PlayerContent 
        song={mockSong} 
        isMobilePlayer={false} 
        toggleMobilePlayer={jest.fn()} 
        playlists={[]}
      />
    );
    
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });
});