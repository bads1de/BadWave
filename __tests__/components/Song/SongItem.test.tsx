import { render, screen, fireEvent } from "@testing-library/react";
import SongItem from "@/components/Song/SongItem";
import { Song } from "@/types";

// Mock ScrollingText component
jest.mock("@/components/common/ScrollingText", () => {
  return {
    __esModule: true,
    default: ({ text }: { text: string }) => {
      const React = require("react");
      return React.createElement("span", null, text);
    },
  };
});

describe("components/Song/SongItem", () => {
  const mockSong: Song = {
    id: "song-1",
    user_id: "user-1",
    author: "Test Author",
    title: "Test Song",
    song_path: "path/to/song.mp3",
    image_path: "path/to/image.jpg",
    genre: "Pop",
    count: "100",
    like_count: "50",
    created_at: "2024-01-01T00:00:00Z",
  };

  const mockOnClick = jest.fn();

  it("renders song information correctly", () => {
    render(<SongItem data={mockSong} onClick={mockOnClick} />);

    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument(); // Play count
    expect(screen.getByText("50")).toBeInTheDocument(); // Like count
    
    // Check for image
    const image = screen.getByRole("img", { name: "Image" });
    expect(image).toHaveAttribute("src", expect.stringContaining("path/to/image.jpg"));
  });

  it("handles click events", () => {
    render(<SongItem data={mockSong} onClick={mockOnClick} />);

    // Click on the image (which covers the item mostly)
    const image = screen.getByRole("img", { name: "Image" });
    fireEvent.click(image);

    expect(mockOnClick).toHaveBeenCalledWith("song-1");
  });

  it("renders link to song page", () => {
    render(<SongItem data={mockSong} onClick={mockOnClick} />);
    
    // We check if there is a link pointing to the song page
    // The link wraps the title area
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/songs/song-1");
  });
});