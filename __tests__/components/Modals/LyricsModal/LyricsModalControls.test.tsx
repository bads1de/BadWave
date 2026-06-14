import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LyricsModalControls from "@/components/Modals/LyricsModal/LyricsModalControls";

jest.mock("@/components/Player/Seekbar", () => "SeekBar");

const defaultProps = {
  isPlaying: false,
  currentTime: 60,
  duration: 180,
  formattedCurrentTime: "1:00",
  formattedDuration: "3:00",
  handlePlay: jest.fn(),
  handleSeek: jest.fn(),
  onPlayPrevious: jest.fn(),
  onPlayNext: jest.fn(),
};

describe("components/Modals/LyricsModal/LyricsModalControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("現在時間と合計時間を表示する", () => {
    render(<LyricsModalControls {...defaultProps} />);
    expect(screen.getByText("1:00")).toBeInTheDocument();
    expect(screen.getByText("3:00")).toBeInTheDocument();
  });

  it("再生ボタンをクリックするとhandlePlayが呼ばれる", () => {
    render(<LyricsModalControls {...defaultProps} />);
    const playButton = screen.getByRole("button", { name: "Play" });
    fireEvent.click(playButton);
    expect(defaultProps.handlePlay).toHaveBeenCalled();
  });

  it("再生中の場合は一時停止ボタンが表示される", () => {
    render(<LyricsModalControls {...defaultProps} isPlaying={true} />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("前の曲ボタンをクリックするとonPlayPreviousが呼ばれる", () => {
    render(<LyricsModalControls {...defaultProps} />);
    const prevButton = screen.getByRole("button", { name: "Previous" });
    fireEvent.click(prevButton);
    expect(defaultProps.onPlayPrevious).toHaveBeenCalled();
  });

  it("次の曲ボタンをクリックするとonPlayNextが呼ばれる", () => {
    render(<LyricsModalControls {...defaultProps} />);
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);
    expect(defaultProps.onPlayNext).toHaveBeenCalled();
  });
});
