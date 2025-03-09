import { renderHook, act } from "@testing-library/react";
import useYouTubePlayer from "@/hooks/player/useYoutubePlayer";

describe("useYouTubePlayer", () => {
  it("初期値が正しく設定されていること", () => {
    const { result } = renderHook(() => useYouTubePlayer("test-video-id"));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.volume).toBe(50);
  });

  it("再生状態をトグルできること", () => {
    const { result } = renderHook(() => useYouTubePlayer("test-video-id"));

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it("ボリューム変更が正しく行われること", () => {
    const { result } = renderHook(() => useYouTubePlayer("test-video-id"));

    act(() => {
      result.current.handleVolumeChange(75);
    });
    expect(result.current.volume).toBe(75);

    // Test lower bound
    act(() => {
      result.current.handleVolumeChange(-10);
    });
    expect(result.current.volume).toBe(0);

    // Test upper bound
    act(() => {
      result.current.handleVolumeChange(150);
    });
    expect(result.current.volume).toBe(100);
  });
});
