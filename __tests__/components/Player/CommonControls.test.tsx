import { render, screen } from "@testing-library/react";
import CommonControls from "@/components/Player/CommonControls";
import React from "react";

jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: (selector?: (state: any) => any) => {
    const state = {
      colorSchemeId: "neon",
      getColorScheme: () => ({
        id: "neon",
        name: "Neon",
        accent: "#ff00ff",
        accentFrom: "#ff00ff",
        accentTo: "#00ffff",
        text: "#ffffff",
        bg: "#0a0a0f",
        colors: {
          theme500: "6, 182, 212",
          glow: "0, 255, 255",
        },
      }),
      hasHydrated: true,
      setHasHydrated: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

// Icon prop must be React.ComponentType (a function/class component), not a JSX element
const PlayIcon: React.FC = () => React.createElement("span", { "data-testid": "play-icon" }, "▶");
const PauseIcon: React.FC = () => React.createElement("span", { "data-testid": "pause-icon" }, "⏸");

describe("components/Player/CommonControls", () => {
  const defaultProps = {
    isPlaying: false,
    isShuffling: false,
    isRepeating: false,
    Icon: PlayIcon,
    handlePlay: jest.fn(),
    onPlayNext: jest.fn(),
    onPlayPrevious: jest.fn(),
    toggleShuffle: jest.fn(),
    toggleRepeat: jest.fn(),
  };

  it("コントロールボタンがレンダリングされる", () => {
    render(<CommonControls {...defaultProps} />);
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
  });

  it("isPlayingがtrueの場合、再生中アイコンが表示される", () => {
    render(<CommonControls {...defaultProps} isPlaying={true} Icon={PauseIcon} />);
    expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
  });

  it("isMobileモードでもレンダリングできる", () => {
    render(<CommonControls {...defaultProps} isMobile={true} />);
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
  });
});
