import { render, screen, fireEvent } from "@testing-library/react";
import TrendBoard from "@/components/Trend/TrendBoard";
import useGetTrendSongs from "@/hooks/data/useGetTrendSongs";
import useOnPlay from "@/hooks/player/useOnPlay";
import { Song } from "@/types";

// Mock hooks
jest.mock("@/hooks/data/useGetTrendSongs");
jest.mock("@/hooks/player/useOnPlay");

// Mock ScrollableContainer
jest.mock("@/components/common/ScrollableContainer", () => {
  return {
    __esModule: true,
    default: ({ children }: any) => {
      const React = require("react");
      return React.createElement("div", { "data-testid": "scrollable-container" }, children);
    },
  };
});

describe("components/Trend/TrendBoard", () => {
  const mockOnPlay = jest.fn();
  const mockSongs: Song[] = [
    {
      id: "song-1",
      title: "Trend Song 1",
      author: "Artist 1",
      image_path: "img1.jpg",
      count: "100",
    } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useGetTrendSongs as jest.Mock).mockReturnValue({
      trends: mockSongs,
      isLoading: false,
      error: null,
    });
    (useOnPlay as jest.Mock).mockReturnValue(mockOnPlay);
  });

  it("renders trend songs", () => {
    render(
      <TrendBoard 
        selectedPeriod="all" 
        onPeriodChange={jest.fn()} 
      />
    );

    expect(screen.getByText("Trend Song 1")).toBeInTheDocument();
    expect(screen.getByText("Artist 1")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument(); // Rank
  });

  it("shows loading state", () => {
    (useGetTrendSongs as jest.Mock).mockReturnValue({
      trends: [],
      isLoading: true,
      error: null,
    });

    render(
      <TrendBoard 
        selectedPeriod="all" 
        onPeriodChange={jest.fn()} 
      />
    );

    expect(screen.getByText("LOADING...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    (useGetTrendSongs as jest.Mock).mockReturnValue({
      trends: [],
      isLoading: false,
      error: { message: "Fetch Error" },
    });

    render(
      <TrendBoard 
        selectedPeriod="all" 
        onPeriodChange={jest.fn()} 
      />
    );

    expect(screen.getByText("Fetch Error")).toBeInTheDocument();
  });

  it("plays song on click", () => {
    render(
      <TrendBoard 
        selectedPeriod="all" 
        onPeriodChange={jest.fn()} 
      />
    );

    // Find the play button overlay or container
    // The implementation has a div with onClick that calls handlePlay
    // It's inside the relative image container.
    // We can simulate click on the song title link or the image container overlay.
    // The overlay has an SVG icon.
    // Let's click the element containing the SVG.
    
    /* eslint-disable testing-library/no-node-access */
    const svgIcon = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'svg' && element.classList.contains('text-[#4c1d95]');
    });
    
    // Click parent of SVG which has the onClick handler
    fireEvent.click(svgIcon.parentElement!);

    expect(mockOnPlay).toHaveBeenCalledWith("song-1");
  });
});
