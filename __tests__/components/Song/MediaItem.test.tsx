import { render, screen, fireEvent } from "@testing-library/react";
import MediaItem from "@/components/Song/MediaItem";
import usePlayer from "@/hooks/player/usePlayer";
import { Song } from "@/types";

jest.mock("@/hooks/player/usePlayer");
jest.mock("@/components/common/ScrollingText", () => {
  return {
    __esModule: true,
    default: ({ text }: { text: string }) => {
      const React = require("react");
      return React.createElement("span", null, text);
    },
  };
});

describe("components/Song/MediaItem", () => {
  const mockSong: Song = {
    id: "song-1",
    title: "Test Song",
    author: "Test Author",
    image_path: "image.jpg",
  } as any;

  const mockSetId = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      setId: mockSetId,
    });
  });

  it("renders song info", () => {
    render(<MediaItem data={mockSong} />);
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    const image = screen.getByRole("img", { name: "MediaItem" });
    expect(image).toHaveAttribute("src", expect.stringContaining("image.jpg"));
  });

  it("handles default click (play song)", () => {
    render(<MediaItem data={mockSong} />);
    
    // Click the container
    fireEvent.click(screen.getByText("Test Song").closest("div.cursor-pointer")!);

    expect(mockSetId).toHaveBeenCalledWith("song-1");
  });

  it("handles custom onClick", () => {
    const customClick = jest.fn();
    render(<MediaItem data={mockSong} onClick={customClick} />);
    
    fireEvent.click(screen.getByText("Test Song").closest("div.cursor-pointer")!);

    expect(customClick).toHaveBeenCalledWith("song-1");
    expect(mockSetId).not.toHaveBeenCalled();
  });

  it("hides info when collapsed", () => {
    render(<MediaItem data={mockSong} isCollapsed={true} />);
    
    expect(screen.queryByText("Test Song")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Author")).not.toBeInTheDocument();
    // Image should still be visible
    expect(screen.getByRole("img", { name: "MediaItem" })).toBeInTheDocument();
  });
});