import { renderHook, act } from "@testing-library/react";
import useOnPlay from "@/hooks/player/useOnPlay";
import usePlayer from "@/hooks/player/usePlayer";
import { createClient } from "@/libs/supabase/client";
import { Song } from "@/types";
import React from "react";

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
  };

  const mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn(),
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

  it("should handle cooldown and pending play", async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest
        .fn()
        .mockReturnThis()
        .mockReturnValue({
          eq: jest
            .fn()
            .mockReturnThis()
            .mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: { count: "10" }, error: null }),
            }),
        }),
      update: jest
        .fn()
        .mockReturnThis()
        .mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
    }));
    mockSupabase.rpc.mockResolvedValue({ data: "11", error: null });

    const { result } = renderHook(() => useOnPlay(mockSongs));

    // 1. Call result.current("1")
    act(() => {
      result.current("1");
    });
    expect(mockPlayer.setId).toHaveBeenCalledWith("1");
    mockPlayer.setId.mockClear();

    // 2. Wait for processPlayAsync("1") to finish (flush microtasks)
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    // 3. Call result.current("2"). (returns early because cooldownRef is true)
    act(() => {
      result.current("2");
    });
    expect(mockPlayer.setId).not.toHaveBeenCalled();

    // 4. Advance timers by 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // 5. processPendingPlay runs. We might need another microtask tick.
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPlayer.setId).toHaveBeenCalledWith("2");
  });
});
