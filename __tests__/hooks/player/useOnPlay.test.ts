import { renderHook, waitFor, act } from "@testing-library/react";
import useOnPlay from "@/hooks/player/useOnPlay";
import usePlayer from "@/hooks/player/usePlayer";
import usePlayHistory from "@/hooks/player/usePlayHistory";
import { createClient } from "@/libs/supabase/client";
import { Song } from "@/types";

// Mock dependencies
jest.mock("@/hooks/player/usePlayer");
jest.mock("@/hooks/player/usePlayHistory");
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("hooks/player/useOnPlay", () => {
  let mockSetId: jest.Mock;
  let mockSetIds: jest.Mock;
  let mockSupabase: any;
  let mockRpc: jest.Mock;
  let mockRecordPlay: jest.Mock;

  const mockSongs: Song[] = [
    { id: "song-1", title: "Song 1", author: "Author 1" } as any,
    { id: "song-2", title: "Song 2", author: "Author 2" } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockSetId = jest.fn();
    mockSetIds = jest.fn();
    mockRecordPlay = jest.fn();
    mockRpc = jest.fn().mockResolvedValue({ error: null });

    (usePlayer as unknown as jest.Mock).mockReturnValue({
      setId: mockSetId,
      setIds: mockSetIds,
    });

    (usePlayHistory as jest.Mock).mockReturnValue({
      recordPlay: mockRecordPlay,
    });

    mockSupabase = {
      rpc: mockRpc,
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should play song immediately and update player state", () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    act(() => {
      result.current("song-1");
    });

    expect(mockSetIds).toHaveBeenCalledWith(["song-1", "song-2"]);
    expect(mockSetId).toHaveBeenCalledWith("song-1");
  });

  it("should call rpc and record history in background", async () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    act(() => {
      result.current("song-1");
    });

    // Wait for async operations (processPlayAsync)
    // We cannot wait on the hook result directly as onPlay is void/async fire-and-forget.
    // But we can check if mocks are eventually called.
    // Since processPlayAsync is not awaited in onPlay, we need to allow promises to resolve.
    
    // Fast-forward timers might not affect promises, but setTimeout in the hook does.
    
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("increment_song_play_count", { song_id: "song-1" });
      expect(mockRecordPlay).toHaveBeenCalledWith("song-1");
    });
  });

  it("should handle cooldown (debounce) for rapid clicks", async () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    // First click
    await act(async () => {
      result.current("song-1");
    });

    expect(mockSetId).toHaveBeenCalledWith("song-1");
    mockSetId.mockClear();

    // Rapid second click (within cooldown)
    await act(async () => {
      result.current("song-2");
    });

    expect(mockSetId).not.toHaveBeenCalled();

    // Fast-forward cooldown
    // We need to ensure microtasks (promises) are processed so isProcessingRef becomes false
    // before the timer fires.
    await act(async () => {
      jest.advanceTimersByTime(350); 
    });

    // Should trigger pending play
    expect(mockSetId).toHaveBeenCalledWith("song-2");
  });
});
