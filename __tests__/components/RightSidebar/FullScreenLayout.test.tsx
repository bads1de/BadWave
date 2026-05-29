import { render, screen } from "@testing-library/react";
import FullScreenLayout from "@/components/RightSidebar/FullScreenLayout";

jest.mock("@/hooks/stores/useLyricsStore", () => ({
  __esModule: true,
  default: () => ({
    showLyrics: false,
    toggleLyrics: jest.fn(),
  }),
}));

jest.mock("@/components/RightSidebar/CurrentSongDisplay", () => "div");
jest.mock("@/components/RightSidebar/NextSongPreview", () => "div");
jest.mock("@/components/Lyrics/SyncedLyrics", () => "div");

describe("components/RightSidebar/FullScreenLayout", () => {
  const defaultProps = {
    song: {
      id: "song-1",
      user_id: "user-1",
      title: "Test Song",
      author: "Test Artist",
      image_path: "/images/test.jpg",
      song_path: "/songs/test.mp3",
      genre: "Electronic",
      duration: 180,
      count: "100",
      like_count: "50",
      created_at: "2024-01-01",
    },
    videoPath: "",
    imagePath: "/images/test.jpg",
    nextSong: undefined,
    nextImagePath: undefined,
  };

  it("FullScreenLayoutがレンダリングされる", () => {
    const { container } = render(<FullScreenLayout {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
