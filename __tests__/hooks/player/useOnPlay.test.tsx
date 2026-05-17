import { renderHook, act } from "@testing-library/react";
import useOnPlay from "@/hooks/player/useOnPlay";
import usePlayer from "@/hooks/player/usePlayer";
import { createClient } from "@/libs/supabase/client";
import { Song } from "@/types";

// Mock Dependencies
jest.mock("@/hooks/player/usePlayer", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/hooks/player/usePlayHistory", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    recordPlay: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("useOnPlay", () => {
  const mockSongs: Song[] = [
    {
      id: "1",
      title: "Song 1",
      author: "Artist 1",
      song_path: "path1",
      image_path: "img1",
      user_id: "u1",
      genre: "pop",
      created_at: "2023-01-01",
      count: "0",
    },
    {
      id: "2",
      title: "Song 2",
      author: "Artist 2",
      song_path: "path2",
      image_path: "img2",
      user_id: "u1",
      genre: "pop",
      created_at: "2023-01-01",
      count: "0",
    },
  ];

  const mockPlayer = {
    setId: jest.fn(),
    setIds: jest.fn(),
    play: jest.fn(),
  };

  const mockSupabase = {
    rpc: jest.fn().mockResolvedValue({ error: null }),
  };

  beforeEach(() => {
    (usePlayer as unknown as any).mockReturnValue(mockPlayer);
    (createClient as unknown as any).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should call play, setId and setIds on first call", () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    act(() => {
      result.current("1");
    });

    expect(mockPlayer.play).toHaveBeenCalled();
    expect(mockPlayer.setIds).toHaveBeenCalledWith(["1", "2"]);
    expect(mockPlayer.setId).toHaveBeenCalledWith("1");
  });

  it("should debounce rapid calls — first call wins, rapid calls dropped", async () => {
    const { result } = renderHook(() => useOnPlay(mockSongs));

    // First call executes immediately (leading)
    act(() => {
      result.current("1");
    });
    expect(mockPlayer.setId).toHaveBeenCalledWith("1");
    mockPlayer.setId.mockClear();

    // Second call within debounce period — dropped (trailing: false)
    act(() => {
      result.current("2");
    });
    expect(mockPlayer.setId).not.toHaveBeenCalled();

    // Advance past debounce period — still not called
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockPlayer.setId).not.toHaveBeenCalled();
  });
});
