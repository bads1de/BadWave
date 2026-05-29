import { render, screen } from "@testing-library/react";
import NextSongPreview from "@/components/RightSidebar/NextSongPreview";

jest.mock("next/image", () => "img");

jest.mock("next/link", () => "a");

describe("components/RightSidebar/NextSongPreview", () => {
  const defaultSong = {
    id: "song-2",
    user_id: "user-1",
    title: "Next Song",
    author: "Next Artist",
    image_path: "/images/next.jpg",
    song_path: "/songs/next.mp3",
    genre: "Rock",
    duration: 200,
    count: "50",
    like_count: "25",
    created_at: "2024-01-01",
  };

  it("NextSongPreviewがレンダリングされる", () => {
    const { container } = render(<NextSongPreview nextSong={defaultSong} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("アーティスト名が表示される", () => {
    render(<NextSongPreview nextSong={defaultSong} />);
    expect(screen.getByText("// AUTH: Next Artist")).toBeInTheDocument();
  });

  it("nextSongがない場合はnullを返す", () => {
    const { container } = render(<NextSongPreview nextSong={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
