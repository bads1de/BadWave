import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MediaItem from "@/components/Song/MediaItem";
import usePlayer from "@/hooks/player/usePlayer";
import { Song } from "@/types";
import "@testing-library/jest-dom";

// Mock hooks
jest.mock("@/hooks/player/usePlayer", () => {
  const mockState = { setId: jest.fn() };
  const fn = (selector: any) => (selector ? selector(mockState) : mockState);
  Object.assign(fn, mockState);
  return { __esModule: true, default: fn };
});

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

describe("MediaItem", () => {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders song information correctly", () => {
    render(<MediaItem data={mockSong} />);

    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("renders image with correct src", () => {
    render(<MediaItem data={mockSong} />);

    const image = screen.getByAltText("MediaItem");
    expect(image).toHaveAttribute("src", "image.jpg");
  });

  it("calls custom onClick when provided", () => {
    const mockOnClick = jest.fn();
    render(<MediaItem data={mockSong} onClick={mockOnClick} />);

    const container = screen
      .getByAltText("MediaItem")
      .closest("div")?.parentElement;
    fireEvent.click(container!);

    expect(mockOnClick).toHaveBeenCalledWith("song-1");
  });

  it("calls player.setId when no custom onClick is provided", () => {
    const player = usePlayer as any;
    render(<MediaItem data={mockSong} />);

    const container = screen
      .getByAltText("MediaItem")
      .closest("div")?.parentElement;
    fireEvent.click(container!);

    expect(player.setId).toHaveBeenCalledWith("song-1");
  });

  it("hides text when isCollapsed is true", () => {
    render(<MediaItem data={mockSong} isCollapsed={true} />);

    expect(screen.queryByText("Test Song")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Author")).not.toBeInTheDocument();
  });

  it("shows text when isCollapsed is false", () => {
    render(<MediaItem data={mockSong} isCollapsed={false} />);

    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });
});
