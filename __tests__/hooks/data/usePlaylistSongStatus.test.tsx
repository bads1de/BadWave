import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import usePlaylistSongStatus from "@/hooks/data/usePlaylistSongStatus";
import { createClient } from "@/libs/supabase/client";
import { useUser } from "@/hooks/auth/useUser";
import React from "react";

// Mock Dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("usePlaylistSongStatus", () => {
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

  it("should return empty status if user is not logged in", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(
      () => usePlaylistSongStatus("song-1", [{ id: "playlist-1" }]),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await waitFor(() => expect(result.current.isInPlaylist).toEqual({}));
  });

  it("should check status correctly when logged in", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-123" } });

    // Proper chaining mock for Supabase
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockEq1 = jest.fn();
    const mockEq2 = jest.fn();
    const mockIn = jest.fn();

    mockSupabase.from = mockFrom;
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq1 });
    mockEq1.mockReturnValue({ eq: mockEq2 });
    mockEq2.mockReturnValue({ in: mockIn });

    mockIn.mockResolvedValue({
      data: [{ playlist_id: "playlist-1" }],
      error: null,
    });

    const playlists = [{ id: "playlist-1" }, { id: "playlist-2" }];
    const { result } = renderHook(
      () => usePlaylistSongStatus("song-1", playlists),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFrom).toHaveBeenCalledWith("playlist_songs");
    expect(result.current.isInPlaylist).toEqual({
      "playlist-1": true,
      "playlist-2": false,
    });
  });
});
