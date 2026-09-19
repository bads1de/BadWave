import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetLikedSongs from "@/hooks/data/useGetLikedSongs";
import getLikedSongs from "@/actions/getLikedSongs";
import React from "react";

// Mock Dependencies
jest.mock("@/actions/getLikedSongs");

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

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return empty list if userId is undefined", async () => {
    const { result } = renderHook(() => useGetLikedSongs(undefined), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.likedSongs).toEqual([]);
    // userId が無い場合はフェッチしない
    expect(getLikedSongs).not.toHaveBeenCalled();
  });

  it("should fetch liked songs via the server action", async () => {
    const mockSongs = [
      {
        id: "song-1",
        title: "Test Song",
        author: "Test Artist",
        songType: "regular" as const,
      },
    ];

    (getLikedSongs as jest.Mock).mockResolvedValue(mockSongs);

    const { result } = renderHook(() => useGetLikedSongs("user-1"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getLikedSongs).toHaveBeenCalledTimes(1);
    expect(result.current.likedSongs).toEqual([
      {
        id: "song-1",
        title: "Test Song",
        author: "Test Artist",
        songType: "regular",
      },
    ]);
  });

  it("should propagate the server action error", async () => {
    (getLikedSongs as jest.Mock).mockRejectedValue(new Error("DB Error"));

    const { result } = renderHook(() => useGetLikedSongs("user-1"), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe("DB Error");
  });
});
