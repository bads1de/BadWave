import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetLikedSongs from "@/hooks/data/useGetLikedSongs";
import { createClient } from "@/libs/supabase/client";
import React from "react";

// Mock Dependencies
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

describe("useGetLikedSongs", () => {
  let queryClient: QueryClient;
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    queryClient = createTestQueryClient();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.from.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty list if userId is undefined", async () => {
    const { result } = renderHook(() => useGetLikedSongs(undefined), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.likedSongs).toEqual([]);
  });

  it("should fetch liked songs correctly", async () => {
    // Mock Chain
    const mockOrder = jest.fn();
    const mockEq = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const mockData = [
      {
        created_at: "2023-01-01",
        songs: {
          id: "song-1",
          title: "Test Song",
          author: "Test Artist",
        },
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { result } = renderHook(() => useGetLikedSongs("user-1"), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockSupabase.from).toHaveBeenCalledWith("liked_songs_regular");
    expect(mockSelect).toHaveBeenCalledWith("*, songs(*)");
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });

    expect(result.current.likedSongs).toEqual([
      {
        id: "song-1",
        title: "Test Song",
        author: "Test Artist",
        songType: "regular",
      },
    ]);
  });
});
