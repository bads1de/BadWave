import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SongItem from "@/components/Song/SongItem";
import { Song } from "@/types";
import "@testing-library/jest-dom";

// Mock next/image
jest.mock("next/image", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: (props: any) => React.createElement("img", props),
  };
});

// Mock ScrollingText
jest.mock("@/components/common/ScrollingText", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ text }: { text: string }) =>
      React.createElement("span", null, text),
  };
});

// Mock react-icons
jest.mock("react-icons/ci", () => {
  const React = require("react");
  return {
    CiHeart: () => React.createElement("div", { "data-testid": "heart-icon" }),
    CiPlay1: () => React.createElement("div", { "data-testid": "play-icon" }),
  };
});

describe("SongItem", () => {
  const mockSong: Song = {
    id: "song-1",
    title: "Test Song",
    author: "Test Author",
    song_path: "song.mp3",
    image_path: "image.jpg",
    user_id: "user-1",
    genre: "pop",
    created_at: "2023-01-01",
    count: "100",
    like_count: 50,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders song information correctly", () => {
    render(<SongItem data={mockSong} onClick={mockOnClick} />);

    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("renders image with correct src", () => {
    render(<SongItem data={mockSong} onClick={mockOnClick} />);

    const image = screen.getByAltText("Image");
    expect(image).toHaveAttribute("src", "image.jpg");
  });

  it("calls onClick when image is clicked", () => {
    render(<SongItem data={mockSong} onClick={mockOnClick} />);

    const image = screen.getByAltText("Image");
    fireEvent.click(image);

    expect(mockOnClick).toHaveBeenCalledWith("song-1");
  });

  it("renders play and heart icons", () => {
    render(<SongItem data={mockSong} onClick={mockOnClick} />);

    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
    expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
  });

  it("has correct link to song detail page", () => {
    const { container } = render(
      <SongItem data={mockSong} onClick={mockOnClick} />
    );

    const link = container.querySelector('a[href="/songs/song-1"]');
    expect(link).toBeInTheDocument();
  });
});
