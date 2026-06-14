import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MobilePlayer from "@/components/Player/MobilePlayer";

jest.mock("@/components/Song/MediaItem", () => "media-item-stub");
jest.mock("@/components/Mobile/MobilePlayerContent", () => "mobile-player-content-stub");

const mockSong = {
  id: "song-1",
  title: "Test Song",
  author: "Test Artist",
  lyrics: "Test lyrics",
  image_path: "/images/test.jpg",
  song_path: "/songs/test.mp3",
  genre: "Rock",
  count: 100,
  user_id: "user-1",
  created_at: "2024-01-01",
};

const MockIcon = (props: any) => React.createElement("span", { "data-testid": "mock-icon" }, "PlayIcon");

const defaultProps = {
  song: mockSong,
  playlists: [],
  isMobilePlayer: false,
  formattedCurrentTime: "1:00",
  formattedDuration: "3:00",
  currentTime: 60,
  duration: 180,
  isPlaying: false,
  isShuffling: false,
  isRepeating: false,
  Icon: MockIcon,
  handlePlay: jest.fn(),
  handleSeek: jest.fn(),
  toggleMobilePlayer: jest.fn(),
  toggleShuffle: jest.fn(),
  toggleRepeat: jest.fn(),
  onPlayNext: jest.fn(),
  onPlayPrevious: jest.fn(),
};

describe("components/Player/MobilePlayer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("MobilePlayerが正しくエクスポートされている", () => {
    expect(MobilePlayer).toBeDefined();
    expect(MobilePlayer.displayName).toBe("MobilePlayer");
  });

  it("MediaItemスタブを表示する", () => {
    const { container } = render(<MobilePlayer {...defaultProps} />);
    expect(container.querySelector("media-item-stub")).toBeInTheDocument();
  });

  it("再生ボタンをクリックするとhandlePlayが呼ばれる", () => {
    render(<MobilePlayer {...defaultProps} />);
    const icon = screen.getByTestId("mock-icon");
    const playButton = icon.closest("div");
    fireEvent.click(playButton!);
    expect(defaultProps.handlePlay).toHaveBeenCalled();
  });

  it("isMobilePlayerがtrueの場合はMobilePlayerContentスタブを表示する", () => {
    const { container } = render(<MobilePlayer {...defaultProps} isMobilePlayer={true} />);
    expect(container.querySelector("mobile-player-content-stub")).toBeInTheDocument();
  });

  it("isMobilePlayerがfalseの場合はMobilePlayerContentスタブを表示しない", () => {
    const { container } = render(<MobilePlayer {...defaultProps} isMobilePlayer={false} />);
    expect(container.querySelector("mobile-player-content-stub")).not.toBeInTheDocument();
  });
});
