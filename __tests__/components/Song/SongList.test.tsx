import { render, screen, fireEvent } from "@testing-library/react";
import SongList from "@/components/Song/SongList";
import usePlayer from "@/hooks/player/usePlayer";
import { Song } from "@/types";

// Mock hooks
jest.mock("@/hooks/player/usePlayer");

// Mock dependencies
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: {
      div: (props: any) => {
        const { children } = props;
        // Avoid passing motion props to div
        const divProps = { 
          className: props.className, 
          onClick: props.onClick,
          "data-testid": "motion-div"
        };
        return React.createElement("div", divProps, children);
      },
    },
  };
});

describe("components/Song/SongList", () => {
  const mockSetId = jest.fn();
  const mockSong: Song = {
    id: "song-1",
    title: "Test Song",
    author: "Test Author",
    genre: "Pop",
    image_path: "img.jpg",
    count: "100",
    like_count: "50",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      setId: mockSetId,
    });
  });

  it("renders song information", () => {
    render(<SongList data={mockSong} />);
    
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("Pop")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("plays song on click", () => {
    render(<SongList data={mockSong} />);
    
    // The clickable area is the image container (first child div)
    // We can find it by finding the image and clicking its parent
    const image = screen.getByAltText("Test Song");
    fireEvent.click(image.parentElement!);

    expect(mockSetId).toHaveBeenCalledWith("song-1");
  });

  it("calls custom onClick if provided", () => {
    const customClick = jest.fn();
    render(<SongList data={mockSong} onClick={customClick} />);
    
    const image = screen.getByAltText("Test Song");
    fireEvent.click(image.parentElement!);

    expect(customClick).toHaveBeenCalledWith("song-1");
    expect(mockSetId).not.toHaveBeenCalled();
  });
});
