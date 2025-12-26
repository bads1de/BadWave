import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SpotlightBoard from "@/components/SpotlightBoard";
import useSpotlightModal from "@/hooks/modal/useSpotlightModal";
import { Spotlight } from "@/types";
import "@testing-library/jest-dom";

// Mock child components and hooks
jest.mock("@/hooks/modal/useSpotlightModal", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/components/common/ScrollableContainer", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function ScrollableContainer(props: any) {
      return React.createElement(
        "div",
        { "data-testid": "scrollable-container" },
        props.children
      );
    },
  };
});

// Mock HTMLVideoElement methods
window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = jest.fn();

describe("SpotlightBoard", () => {
  const mockSpotlightData: Spotlight[] = [
    {
      id: "1",
      video_path: "/videos/video1.mp4",
      title: "Spotlight 1",
      author: "Author 1",
    },
    {
      id: "2",
      video_path: "/videos/video2.mp4",
      title: "Spotlight 2",
      author: "Author 2",
    },
  ];

  const mockOnOpen = jest.fn();

  beforeEach(() => {
    // Reset internal state if possible, though SpotlightBoard uses it internally
    (useSpotlightModal as any).mockReturnValue({
      onOpen: mockOnOpen,
    });
    jest.clearAllMocks();
  });

  it("renders spotlight videos", () => {
    render(<SpotlightBoard spotlightData={mockSpotlightData} />);

    mockSpotlightData.forEach((item) => {
      const video = document.querySelector(`video[src="${item.video_path}"]`);
      expect(video).toBeInTheDocument();
    });
  });

  it("plays video on hover", () => {
    render(<SpotlightBoard spotlightData={mockSpotlightData} />);
    const buttons = screen.getAllByRole("button");
    const container = buttons[0].parentElement!;

    fireEvent.mouseEnter(container);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("pauses video on leave", () => {
    render(<SpotlightBoard spotlightData={mockSpotlightData} />);
    const buttons = screen.getAllByRole("button");
    const container = buttons[0].parentElement!;

    fireEvent.mouseLeave(container);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it("opens modal on click", () => {
    render(<SpotlightBoard spotlightData={mockSpotlightData} />);
    const buttons = screen.getAllByRole("button");
    const container = buttons[0].parentElement!;

    fireEvent.click(container);
    expect(mockOnOpen).toHaveBeenCalledWith(mockSpotlightData[0]);
  });
});
