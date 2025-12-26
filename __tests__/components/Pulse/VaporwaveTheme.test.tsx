import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import VaporwaveTheme from "@/app/pulse/components/VaporwaveTheme";
import "@testing-library/jest-dom";

// Mock child components
jest.mock("@/app/pulse/components/RetroPlayer", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function RetroPlayer(props: any) {
      return React.createElement(
        "div",
        { "data-testid": "retro-player" },
        `RetroPlayer: ${props.trackTitle}`,
        React.createElement(
          "button",
          { onClick: props.togglePlay, "data-testid": "toggle-play" },
          "Play/Pause"
        ),
        React.createElement(
          "button",
          { onClick: props.onNext, "data-testid": "next-track" },
          "Next"
        ),
        React.createElement(
          "button",
          { onClick: props.onPrev, "data-testid": "prev-track" },
          "Prev"
        )
      );
    },
  };
});

jest.mock("@/app/pulse/components/Visualizer", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function Visualizer() {
      return React.createElement(
        "div",
        { "data-testid": "visualizer" },
        "Visualizer"
      );
    },
  };
});

jest.mock("@/app/pulse/components/WireframeBackground", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function WireframeBackground() {
      return React.createElement(
        "div",
        { "data-testid": "wireframe-bg" },
        "WireframeBackground"
      );
    },
  };
});

jest.mock("@/app/pulse/components/PulseWaveform", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function PulseWaveform() {
      return React.createElement(
        "div",
        { "data-testid": "pulse-waveform" },
        "PulseWaveform"
      );
    },
  };
});

describe("VaporwaveTheme", () => {
  const defaultProps = {
    pulses: [
      {
        id: "1",
        title: "Track 1",
        genre: "Vaporwave",
        music_path: "track1.mp3",
        model_path: "model1.glb",
        image_path: "img1.png",
        video_path: "vid1.mp4",
        user_id: "user1",
        created_at: "2023-01-01",
      },
      {
        id: "2",
        title: "Track 2",
        genre: "Future Funk",
        music_path: "track2.mp3",
        model_path: "model2.glb",
        image_path: "img2.png",
        video_path: "vid2.mp4",
        user_id: "user1",
        created_at: "2023-01-01",
      },
    ],
    currentPulse: {
      id: "1",
      title: "Track 1",
      genre: "Vaporwave",
      music_path: "track1.mp3",
      model_path: "model1.glb",
      image_path: "img1.png",
      video_path: "vid1.mp4",
      user_id: "user1",
      created_at: "2023-01-01",
    },
    currentPulseIndex: 0,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 180,
    analyser: null,
    hasStarted: false,
    audioRef: { current: null },
    handleStart: jest.fn(),
    togglePlay: jest.fn(),
    handleVolumeChange: jest.fn(),
    onSeek: jest.fn(),
    handleNextPulse: jest.fn(),
    handlePrevPulse: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Start Overlay when not started", () => {
    render(<VaporwaveTheme {...defaultProps} />);

    expect(screen.getByText("PRESS START")).toBeInTheDocument();
    expect(screen.getByText("[ CLICK TO INSERT_COIN ]")).toBeInTheDocument();

    const overlay = screen.getByText("PRESS START").closest("div");
    fireEvent.click(overlay!);
    expect(defaultProps.handleStart).toHaveBeenCalled();
  });

  it("renders Main Content when started", () => {
    render(<VaporwaveTheme {...defaultProps} hasStarted={true} />);

    expect(screen.queryByText("PRESS START")).not.toBeInTheDocument();
    expect(screen.getByTestId("retro-player")).toBeInTheDocument();
    expect(screen.getByTestId("visualizer")).toBeInTheDocument();
    expect(screen.getByTestId("wireframe-bg")).toBeInTheDocument();
    expect(screen.getByTestId("pulse-waveform")).toBeInTheDocument();

    expect(screen.getByText("Track 1")).toBeInTheDocument();
    expect(screen.getByText("Vaporwave")).toBeInTheDocument();
  });

  it("passes props correctly to RetroPlayer", () => {
    render(<VaporwaveTheme {...defaultProps} hasStarted={true} />);

    fireEvent.click(screen.getByTestId("toggle-play"));
    expect(defaultProps.togglePlay).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("next-track"));
    expect(defaultProps.handleNextPulse).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("prev-track"));
    expect(defaultProps.handlePrevPulse).toHaveBeenCalled();
  });

  it("renders Japanese vertical text", () => {
    render(<VaporwaveTheme {...defaultProps} hasStarted={true} />);
    expect(screen.getByText("ラジオ")).toBeInTheDocument();
    expect(screen.getByText("音楽放")).toBeInTheDocument();
  });
});
