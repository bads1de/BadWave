import { renderHook, waitFor } from "@testing-library/react";
import useGetPlaylistSongs from "@/hooks/data/useGetPlaylistSongs";
import getPlaylistSongs from "@/actions/getPlaylistSongs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock Server Action
jest.mock("@/actions/getPlaylistSongs");

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("useGetPlaylistSongs", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return empty array if playlistId is not provided", async () => {
    const { result } = renderHook(() => useGetPlaylistSongs(), { wrapper });

    expect(result.current.songs).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(getPlaylistSongs).not.toHaveBeenCalled();
  });

  it("should return songs via the server action for a playlist", async () => {
    (getPlaylistSongs as jest.Mock).mockResolvedValue([
      {
        id: "song-1",
        title: "Song 1",
        author: "Author 1",
        songType: "regular",
      },
      {
        id: "song-2",
        title: "Song 2",
        author: "Author 2",
        songType: "regular",
      },
    ]);

    const { result } = renderHook(() => useGetPlaylistSongs("playlist-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlaylistSongs).toHaveBeenCalledWith("playlist-1");
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs[0]).toEqual({
      id: "song-1",
      title: "Song 1",
      author: "Author 1",
      songType: "regular",
    });
  });

  it("should propagate the server action error", async () => {
    (getPlaylistSongs as jest.Mock).mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useGetPlaylistSongs("playlist-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe("Fetch failed");
  });
});
