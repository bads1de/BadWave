import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RetroPlayer from "@/app/pulse/components/RetroPlayer";
import "@testing-library/jest-dom";

// Mock react-icons
jest.mock("react-icons/fa", () => {
  const React = require("react");
  return {
    FaPlay: () => React.createElement("div", { "data-testid": "fa-play" }),
    FaPause: () => React.createElement("div", { "data-testid": "fa-pause" }),
    FaStepBackward: () =>
      React.createElement("div", { "data-testid": "fa-step-backward" }),
    FaStepForward: () =>
      React.createElement("div", { "data-testid": "fa-step-forward" }),
  };
});

jest.mock("react-icons/md", () => {
  const React = require("react");
  return {
    MdSkipPrevious: () =>
      React.createElement("div", { "data-testid": "md-skip-previous" }),
    MdSkipNext: () =>
      React.createElement("div", { "data-testid": "md-skip-next" }),
  };
});

describe("RetroPlayer", () => {
  const defaultProps = {
    audioRef: { current: null },
    isPlaying: false,
    togglePlay: jest.fn(),
    volume: 1,
    handleVolumeChange: jest.fn(),
    currentTime: 0,
    duration: 180, // 3 minutes
    onSeek: jest.fn(),
    onNext: jest.fn(),
    onPrev: jest.fn(),
    trackTitle: "Test Track",
    trackGenre: "Test Genre",
    nextTrackTitle: "Next Track",
    nextTrackGenre: "Next Genre",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders track info correctly", () => {
    render(<RetroPlayer {...defaultProps} />);

    expect(screen.getByText("Test Track")).toBeInTheDocument();
    expect(screen.getByText("Test Genre")).toBeInTheDocument();
    expect(screen.getByText("Next Track")).toBeInTheDocument();
    expect(screen.getByText("Next Genre")).toBeInTheDocument();
  });

  it("renders 'Unknown Track' when no props provided", () => {
    render(
      <RetroPlayer
        {...defaultProps}
        trackTitle={undefined}
        trackGenre={undefined}
        nextTrackTitle={undefined}
        nextTrackGenre={undefined}
      />
    );

    expect(screen.getByText("Unknown Track")).toBeInTheDocument();
    expect(screen.getByText("Unknown Genre")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("toggles play state correctly", () => {
    const { rerender } = render(
      <RetroPlayer {...defaultProps} isPlaying={false} />
    );

    // Check initial state (Play icon should be present)
    expect(screen.getByTestId("fa-play")).toBeInTheDocument();
    expect(screen.queryByTestId("fa-pause")).not.toBeInTheDocument();

    // Click play button container
    const playButton = screen.getByTestId("fa-play").parentElement;
    // Note: closest('button') is better if we click the icon but the icon is a div now.
    // The button wraps the icon.
    // In component: <button onClick={togglePlay}> <FaPlay /> </button>
    // So if we query fa-play, parentElement or closest('button') should work.

    // However, if we click the wrapper, we might need to find the button role.
    const button = screen.getByRole("button", { name: "" }); // There are multiple buttons.
    // Let's rely on finding the button that contains the play icon.
    // Using closest('button') on the icon is reliable.

    fireEvent.click(playButton?.closest("button")!);
    expect(defaultProps.togglePlay).toHaveBeenCalledTimes(1);

    // Rerender with isPlaying=true
    rerender(<RetroPlayer {...defaultProps} isPlaying={true} />);
    expect(screen.getByTestId("fa-pause")).toBeInTheDocument();
    expect(screen.queryByTestId("fa-play")).not.toBeInTheDocument();
  });

  it("handles navigation buttons", () => {
    render(<RetroPlayer {...defaultProps} />);

    // Previous
    const prevIcon = screen.getByTestId("md-skip-previous");
    const prevButton = prevIcon.closest("button");
    fireEvent.click(prevButton!);
    expect(defaultProps.onPrev).toHaveBeenCalledTimes(1);

    // Next
    const nextIcon = screen.getByTestId("md-skip-next");
    const nextButton = nextIcon.closest("button");
    fireEvent.click(nextButton!);
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("handles seek buttons", () => {
    render(<RetroPlayer {...defaultProps} />);

    // Seek Backward -15s
    const backIcon = screen.getByTestId("fa-step-backward");
    const backButton = backIcon.closest("button");
    fireEvent.click(backButton!);
    expect(defaultProps.onSeek).toHaveBeenCalledWith(-15);

    // Seek Forward +15s
    const fwdIcon = screen.getByTestId("fa-step-forward");
    const fwdButton = fwdIcon.closest("button");
    fireEvent.click(fwdButton!);
    expect(defaultProps.onSeek).toHaveBeenCalledWith(15);
  });

  it("displays formatted time correctly", () => {
    render(<RetroPlayer {...defaultProps} currentTime={65} duration={125} />);
    // 65s = 01:05
    // 125s = 02:05
    expect(screen.getByText("01:05")).toBeInTheDocument();
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });
});
