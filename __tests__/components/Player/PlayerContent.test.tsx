import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerContent from "@/components/Player/PlayerContent";
import useAudioPlayer from "@/hooks/audio/useAudioPlayer";
import { Song, Playlist } from "@/types";
import "@testing-library/jest-dom";

// Mock child components and hooks
jest.mock("@/components/Player/DesktopPlayer", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement("div", { "data-testid": "desktop-player" }),
  };
});
jest.mock("@/components/Player/MobilePlayer", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement("div", { "data-testid": "mobile-player" }),
  };
});

jest.mock("@/hooks/audio/useAudioPlayer");
jest.mock("@/hooks/stores/useLyricsStore", () => ({
  __esModule: true,
  default: () => ({ toggleLyrics: jest.fn() }),
}));

describe("PlayerContent", () => {
  const mockSong: Song = {
    id: "1",
    title: "Test Song",
    author: "Test Author",
    song_path: "test.mp3",
    image_path: "test.jpg",
    user_id: "user-1",
    genre: "pop",
    created_at: "2023-01-01",
    count: "0",
  };

  const mockPlaylists: Playlist[] = [];

  const mockAudioState = {
    Icon: () => null,
    VolumeIcon: () => null,
    formattedCurrentTime: "0:00",
    formattedDuration: "3:00",
    volume: 0.1,
    setVolume: jest.fn(),
    audioRef: { current: null },
    currentTime: 0,
    duration: 180,
    isPlaying: false,
    isRepeating: false,
    isShuffling: false,
    handlePlay: jest.fn(),
    handleSeek: jest.fn(),
    onPlayNext: jest.fn(),
    onPlayPrevious: jest.fn(),
    toggleRepeat: jest.fn(),
    toggleShuffle: jest.fn(),
    handleVolumeClick: jest.fn(),
    showVolumeSlider: false,
    setShowVolumeSlider: jest.fn(),
  };

  beforeEach(() => {
    (useAudioPlayer as jest.Mock).mockReturnValue(mockAudioState);
    jest.clearAllMocks();
  });

  it("renders DesktopPlayer when isMobilePlayer is false", () => {
    render(
      <PlayerContent
        song={mockSong}
        isMobilePlayer={false}
        toggleMobilePlayer={jest.fn()}
        playlists={mockPlaylists}
      />
    );

    expect(screen.getByTestId("desktop-player")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-player")).not.toBeInTheDocument();
  });

  it("renders MobilePlayer when isMobilePlayer is true", () => {
    render(
      <PlayerContent
        song={mockSong}
        isMobilePlayer={true}
        toggleMobilePlayer={jest.fn()}
        playlists={mockPlaylists}
      />
    );

    expect(screen.getByTestId("mobile-player")).toBeInTheDocument();
    expect(screen.queryByTestId("desktop-player")).not.toBeInTheDocument();
  });

  it("renders an audio element with the correct source", () => {
    const { container } = render(
      <PlayerContent
        song={mockSong}
        isMobilePlayer={false}
        toggleMobilePlayer={jest.fn()}
        playlists={mockPlaylists}
      />
    );

    const audio = container.querySelector("audio");
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute("src", mockSong.song_path);
  });
});
