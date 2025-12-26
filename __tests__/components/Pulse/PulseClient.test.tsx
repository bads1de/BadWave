import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PulseClient from "@/app/pulse/components/PulseClient";
import "@testing-library/jest-dom";

// Mock child components
jest.mock("@/app/pulse/components/VaporwaveTheme", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function VaporwaveTheme(props: any) {
      return React.createElement(
        "div",
        { "data-testid": "vaporwave-theme" },
        "Vaporwave Theme",
        React.createElement(
          "button",
          { onClick: props.handleNextPulse, "data-testid": "next-btn" },
          "Next"
        ),
        React.createElement(
          "button",
          { onClick: props.handleStart, "data-testid": "start-btn" },
          "Start"
        )
      );
    },
  };
});

jest.mock("@/app/pulse/components/CityPopTheme", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function CityPopTheme(props: any) {
      return React.createElement(
        "div",
        { "data-testid": "citypop-theme" },
        "City Pop Theme"
      );
    },
  };
});

// Mock Pulse type
const mockPulses = [
  {
    id: "1",
    model_path: "model1.glb",
    image_path: "image1.png",
    music_path: "music1.mp3",
    title: "Pulse 1",
    genre: "Vaporwave",
    video_path: "video1.mp4",
    user_id: "user1",
    created_at: "2023-01-01",
  },
  {
    id: "2",
    model_path: "model2.glb",
    image_path: "image2.png",
    music_path: "music2.mp3",
    title: "Pulse 2",
    genre: "City Pop",
    video_path: "video2.mp4",
    user_id: "user1",
    created_at: "2023-01-01",
  },
];

describe("PulseClient", () => {
  beforeAll(() => {
    // Mock HTMLMediaElement functions
    window.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
    window.HTMLMediaElement.prototype.load = jest.fn();
  });

  it("renders VaporwaveTheme for non-City Pop genre", () => {
    render(<PulseClient pulses={[mockPulses[0]]} />);
    expect(screen.getByTestId("vaporwave-theme")).toBeInTheDocument();
    expect(screen.queryByTestId("citypop-theme")).not.toBeInTheDocument();
  });

  it("renders CityPopTheme for City Pop genre", () => {
    render(<PulseClient pulses={[mockPulses[1]]} />);
    expect(screen.getByTestId("citypop-theme")).toBeInTheDocument();
    expect(screen.queryByTestId("vaporwave-theme")).not.toBeInTheDocument();
  });

  it("switches theme when pulse changes", async () => {
    // Start with Vaporwave, check transition to CityPop
    render(<PulseClient pulses={mockPulses} />);

    // Initially Pulse 1 (Vaporwave)
    expect(screen.getByTestId("vaporwave-theme")).toBeInTheDocument();

    // Click next (exposed via mock)
    const nextBtn = screen.getByTestId("next-btn");
    fireEvent.click(nextBtn);

    // Should switch to Pulse 2 (City Pop)
    expect(screen.getByTestId("citypop-theme")).toBeInTheDocument();
  });

  it("renders audio element with correct source", () => {
    const { container } = render(<PulseClient pulses={[mockPulses[0]]} />);

    const audio = container.querySelector("audio");
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute("src", "music1.mp3");
  });
});
