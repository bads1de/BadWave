import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CityPopTheme from "@/app/pulse/components/CityPopTheme";
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

describe("CityPopTheme", () => {
  const defaultProps = {
    pulses: [],
    currentPulse: {
      id: "1",
      model_path: "model1.glb",
      image_path: "image1.png",
      music_path: "music1.mp3",
      title: "Plastic Love",
      genre: "City Pop",
      video_path: "video1.mp4",
      user_id: "user1",
      created_at: "2023-01-01",
    },
    currentPulseIndex: 0,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 180,
    analyser: null,
    hasStarted: true,
    audioRef: { current: null },
    handleStart: jest.fn(),
    togglePlay: jest.fn(),
    handleVolumeChange: jest.fn(),
    onSeek: jest.fn(),
    handleNextPulse: jest.fn(),
    handlePrevPulse: jest.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(window, "requestAnimationFrame", {
      writable: true,
      value: jest.fn().mockImplementation((cb) => 1),
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      writable: true,
      value: jest.fn(),
    });
  });

  it("renders track details correctly", () => {
    render(<CityPopTheme {...defaultProps} />);
    // Title appears twice (desktop and mobile layouts)
    expect(screen.getAllByText("Plastic Love").length).toBeGreaterThan(0);
    expect(screen.getAllByText("City Pop").length).toBeGreaterThan(0);
  });

  it("renders CD Image", () => {
    render(<CityPopTheme {...defaultProps} />);
    expect(screen.getByAltText("City Pop CD")).toBeInTheDocument();
  });

  it("handles playback controls", () => {
    render(<CityPopTheme {...defaultProps} />);
    const playIcon = screen.getByTestId("fa-play");
    const playBtn = playIcon.closest("button");
    fireEvent.click(playBtn!);
    expect(defaultProps.togglePlay).toHaveBeenCalled();
  });

  it("handles seek controls", () => {
    render(<CityPopTheme {...defaultProps} />);
    const backIcon = screen.getByTestId("fa-step-backward");
    const backBtn = backIcon.closest("button");
    fireEvent.click(backBtn!);
    expect(defaultProps.onSeek).toHaveBeenCalledWith(-10);
  });
});
