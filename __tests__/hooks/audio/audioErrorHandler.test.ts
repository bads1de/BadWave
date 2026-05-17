import { createAudioErrorHandler } from "@/hooks/audio/audioErrorHandler";
import toast from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

describe("audioErrorHandler", () => {
  const mockSetIsPlaying = jest.fn();
  const mockOnPlayNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createHandler(maxConsecutiveErrors = 3) {
    return createAudioErrorHandler({
      maxConsecutiveErrors,
      skipDelayMs: 500,
      setIsPlaying: mockSetIsPlaying,
      onPlayNext: mockOnPlayNext,
    });
  }

  it("should auto-skip to next song on error when under threshold", () => {
    const handler = createHandler();

    handler.handleError();

    expect(mockSetIsPlaying).toHaveBeenCalledWith(false);
    expect(mockOnPlayNext).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(mockOnPlayNext).toHaveBeenCalledTimes(1);
  });

  it("should show toast after max consecutive errors", () => {
    const handler = createHandler(3);

    handler.handleError();
    jest.advanceTimersByTime(500);
    handler.handleError();
    jest.advanceTimersByTime(500);
    handler.handleError();

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("連続して再生エラー"),
      expect.objectContaining({ duration: 5000 })
    );
  });

  it("should not auto-skip after reaching max errors", () => {
    const handler = createHandler(2);

    handler.handleError();
    jest.advanceTimersByTime(500);
    handler.handleError();

    jest.advanceTimersByTime(1000);
    // onPlayNext called once for the first error's skip, not for the second
    expect(mockOnPlayNext).toHaveBeenCalledTimes(1);
  });

  it("should reset error count on resetErrors", () => {
    const handler = createHandler(3);

    handler.handleError();
    jest.advanceTimersByTime(500);
    handler.resetErrors();
    handler.handleError();
    jest.advanceTimersByTime(500);
    handler.handleError();

    // 2 errors after reset (under threshold 3), no toast
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockOnPlayNext).toHaveBeenCalledTimes(2);
  });

  it("should report error count", () => {
    const handler = createHandler();

    expect(handler.getErrorCount()).toBe(0);
    handler.handleError();
    expect(handler.getErrorCount()).toBe(1);
    handler.handleError();
    expect(handler.getErrorCount()).toBe(2);
    handler.resetErrors();
    expect(handler.getErrorCount()).toBe(0);
  });
});
