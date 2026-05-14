import { render, screen } from "@testing-library/react";
import ForYouBoard from "@/components/ForYou/ForYouBoard";

jest.mock("@/components/common/ScrollableContainer", () => "div");

jest.mock("@/components/Song/SongItem", () => "div");

jest.mock("framer-motion", () => ({
  motion: { div: "div" },
}));

jest.mock("@/hooks/player/useOnPlay", () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

describe("components/ForYou/ForYouBoard", () => {
  const mockSongs = [
    {
      id: "song-1",
      title: "Recommended Song 1",
      author: "Artist 1",
      song_path: "/songs/song1.mp3",
      image_path: "/images/song1.jpg",
      genre: "Electronic",
      duration: 180,
      count: 100,
      like_count: 50,
      created_at: "2024-01-01",
    },
  ];

  it("レコメンドがない場合、メッセージが表示される", () => {
    render(<ForYouBoard recommendations={[]} />);
    expect(screen.getByText(/まだ推薦曲がありません/)).toBeInTheDocument();
  });
});
