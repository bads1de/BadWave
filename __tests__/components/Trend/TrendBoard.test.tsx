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
    expect(screen.getByText(/\/\/ AUTH: Artist 1/)).toBeInTheDocument();
    
    // Rank #1 is broken into <span>#</span> and "1"
    // Use a more robust selector to find the rank container
    const rankElement = screen.getByText((content, element) => {
      const hasText = (node: Element) => node.textContent === "#1";
      const nodeHasText = hasText(element!);
      const childrenDontHaveText = Array.from(element!.children).every(
        child => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    });
    expect(rankElement).toBeInTheDocument();
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

    expect(screen.getByText(/ANALYZING_TREND_STREAM/)).toBeInTheDocument();
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

    expect(screen.getByText(/ERROR: Fetch Error/)).toBeInTheDocument();
  });

  it("plays song on click", () => {
    render(
      <TrendBoard 
        selectedPeriod="all" 
        onPeriodChange={jest.fn()} 
      />
    );

    // Find the play button overlay
    // It's the div with opacity-0 group-hover:opacity-100
    // Since it's hard to find by text/role, let's find the SVG and click its parent
    const svg = document.querySelector('svg.text-white');
    if (svg && svg.parentElement) {
      fireEvent.click(svg.parentElement);
    } else {
      // Fallback if the above fails in some environments
      const songTitle = screen.getByText("Trend Song 1");
      fireEvent.click(songTitle);
    }

    expect(mockOnPlay).toHaveBeenCalledWith("song-1");
  });
});
