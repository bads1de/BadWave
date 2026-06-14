import * as React from "react";
import { render, screen } from "@testing-library/react";
import LyricsModalArtwork from "@/components/Modals/LyricsModal/LyricsModalArtwork";

jest.mock("next/image", () => "img");

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

describe("components/Modals/LyricsModal/LyricsModalArtwork", () => {
  it("曲名とアーティスト名を表示する", () => {
    render(<LyricsModalArtwork song={mockSong} />);
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("image_pathがある場合は画像を表示する", () => {
    render(<LyricsModalArtwork song={mockSong} />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("image_pathがない場合はプレースホルダーを表示する", () => {
    const songWithoutImage = { ...mockSong, image_path: "" };
    render(<LyricsModalArtwork song={songWithoutImage} />);
    const placeholders = screen.getAllByText("♪");
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
