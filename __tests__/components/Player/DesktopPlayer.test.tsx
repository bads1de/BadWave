import * as React from "react";
import { render, screen } from "@testing-library/react";
import DesktopPlayer from "@/components/Player/DesktopPlayer";
import { Song, Playlist } from "@/types";

// モック
jest.mock("@/hooks/stores/useLyricsStore", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    toggleLyrics: jest.fn(),
  })),
}));

jest.mock("@/components/Song/MediaItem", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement("div", { "data-testid": "media-item" }, "MediaItem"),
  };
});

jest.mock("@/components/Player/CommonControls", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement(
        "div",
        { "data-testid": "common-controls" },
        "CommonControls"
      ),
  };
});

jest.mock("@/components/Player/Seekbar", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement("div", { "data-testid": "seekbar" }, "SeekBar"),
  };
});

jest.mock("@/components/Playlist/AddPlaylist", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement(
        "div",
        { "data-testid": "add-playlist" },
        "AddPlaylist"
      ),
  };
});

jest.mock("@/components/LikeButton", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement(
        "div",
        { "data-testid": "like-button" },
        "LikeButton"
      ),
  };
});

jest.mock("@/components/Player/Slider", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement("div", { "data-testid": "slider" }, "Slider"),
  };
});

// react-icons のモック
jest.mock("react-icons/bs", () => ({
  BsPlayFill: () => <div data-testid="play-icon-internal" />,
  BsPauseFill: () => <div data-testid="pause-icon-internal" />,
}));

jest.mock("react-icons/md", () => ({
  MdLyrics: () => <div data-testid="lyrics-icon" />,
}));

describe("DesktopPlayer", () => {
  const mockSong: Song = {
    id: "1",
    user_id: "user1",
    author: "Artist",
    title: "Song Title",
    song_path: "song.mp3",
    image_path: "image.png",
    created_at: "2023-01-01T00:00:00Z",
  };

  const mockPlaylists: Playlist[] = [];

  const defaultProps = {
    song: mockSong,
    playlists: mockPlaylists,
    formattedCurrentTime: "0:00",
    formattedDuration: "3:00",
    currentTime: 0,
    duration: 180,
    isPlaying: false,
    isShuffling: false,
    isRepeating: false,
    volume: 0.5,
    setVolume: jest.fn(),
    Icon: () => <div data-testid="mobile-play-icon" />,
    VolumeIcon: () => <div data-testid="volume-icon" />,
    handleVolumeClick: jest.fn(),
    showVolumeSlider: false,
    handlePlay: jest.fn(),
    handleSeek: jest.fn(),
    onPlayNext: jest.fn(),
    onPlayPrevious: jest.fn(),
    toggleShuffle: jest.fn(),
    toggleRepeat: jest.fn(),
    toggleMobilePlayer: jest.fn(),
  };

  it("モバイル用の再生ボタンが表示されること", () => {
    render(<DesktopPlayer {...defaultProps} />);

    // Icon プロップとして渡されたコンポーネントが表示されていることを確認
    const mobilePlayIcon = screen.getByTestId("mobile-play-icon");

    // それが md:hidden なコンテナ内にあることを確認
    const container = mobilePlayIcon.closest(".md\\:hidden");
    expect(container).toBeInTheDocument();
  });
});
