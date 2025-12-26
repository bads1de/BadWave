import { renderHook, waitFor } from "@testing-library/react";
import useGetPlaylistSongs from "@/hooks/data/useGetPlaylistSongs";
import { createClient } from "@/libs/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Supabase client
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("useGetPlaylistSongs", () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );

  it("should return empty array if playlistId is not provided", async () => {
    const { result } = renderHook(() => useGetPlaylistSongs(), { wrapper });

    expect(result.current.songs).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should return mapped songs for a playlist", async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: [
        {
          songs: {
            id: "song-1",
            title: "Song 1",
            author: "Author 1",
          },
        },
        {
          songs: {
            id: "song-2",
            title: "Song 2",
            author: "Author 2",
          },
        },
      ],
      error: null,
    });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useGetPlaylistSongs("playlist-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs[0]).toEqual({
      id: "song-1",
      title: "Song 1",
      author: "Author 1",
      songType: "regular",
    });
  });

  it("should throw error if fetching fails", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockOrder = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Fetch failed" },
    });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useGetPlaylistSongs("playlist-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe(
      "プレイリストの曲の取得に失敗しました"
    );
    consoleSpy.mockRestore();
  });
});
