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
  let mockPlay: jest.Mock;
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
    mockPlay = jest.fn();
    mockRecordPlay = jest.fn().mockResolvedValue(undefined);
    mockRpc = jest.fn().mockResolvedValue({ error: null });

    (usePlayer as unknown as jest.Mock).mockReturnValue({
      setId: mockSetId,
      setIds: mockSetIds,
      play: mockPlay,
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

  it("should play song immediately on first call", () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    act(() => {
      result.current("song-1");
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(mockSetIds).toHaveBeenCalledWith(["song-1", "song-2"]);
    expect(mockSetId).toHaveBeenCalledWith("song-1");
  });

  it("should call rpc and record history in background", async () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    act(() => {
      result.current("song-1");
    });

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("increment_song_play_count", {
        song_id: "song-1",
      });
      expect(mockRecordPlay).toHaveBeenCalledWith("song-1");
    });
  });

  it("should debounce rapid clicks — first call wins, rapid calls dropped", async () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    // First click — executes immediately (leading)
    act(() => {
      result.current("song-1");
    });
    expect(mockSetId).toHaveBeenCalledWith("song-1");
    mockSetId.mockClear();

    // Rapid second click within debounce period — dropped (trailing: false)
    act(() => {
      result.current("song-2");
    });
    expect(mockSetId).not.toHaveBeenCalled();

    // Advance past debounce period
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Still not called — trailing is disabled
    expect(mockSetId).not.toHaveBeenCalled();
  });

  it("should allow new play after debounce period expires", async () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    // First click
    act(() => {
      result.current("song-1");
    });
    expect(mockSetId).toHaveBeenCalledWith("song-1");
    mockSetId.mockClear();

    // Advance past debounce period
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // New click after debounce — should execute
    act(() => {
      result.current("song-2");
    });
    expect(mockSetId).toHaveBeenCalledWith("song-2");
  });
});
