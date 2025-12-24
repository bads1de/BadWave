import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/libs/supabase/client";
import * as React from "react";
import useGetSongsByGenres from "@/hooks/data/useGetSongGenres";

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

const mockSongs = [
  { id: "1", title: "ロックソング", genre: "rock" },
  { id: "2", title: "ポップソング", genre: "pop" },
  { id: "3", title: "ジャズソング", genre: "jazz" },
];

describe("useGetSongsByGenres", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();

    // モック実装を修正
    (createClient as jest.Mock).mockImplementation(() => ({
      from: () => ({
        select: () => ({
          or: () => ({
            neq: () => ({
              limit: () => Promise.resolve({ data: mockSongs, error: null }),
            }),
            limit: () => Promise.resolve({ data: mockSongs, error: null }),
          }),
        }),
      }),
    }));
  });

  it("ジャンルが指定されていない場合、空の配列を返すべき", async () => {
    const { result } = renderHook(() => useGetSongsByGenres([]), { wrapper });

    await waitFor(() => {
      expect(result.current.songGenres).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("ジャンルに基づいて曲を取得するべき", async () => {
    const genres = ["rock", "pop"];
    const { result } = renderHook(() => useGetSongsByGenres(genres), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.songGenres).toEqual(mockSongs);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("指定された曲IDを除外するべき", async () => {
    const genres = ["rock"];
    const excludeId = "1";
    const { result } = renderHook(
      () => useGetSongsByGenres(genres, excludeId),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.songGenres).toEqual(mockSongs);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("APIエラーを処理するべき", async () => {
    const mockError = new Error("APIエラー");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (createClient as jest.Mock).mockImplementation(() => ({
      from: () => ({
        select: () => ({
          or: () => ({
            neq: () => ({
              limit: () => Promise.resolve({ data: null, error: mockError }),
            }),
            limit: () => Promise.resolve({ data: null, error: mockError }),
          }),
        }),
      }),
    }));

    const { result } = renderHook(() => useGetSongsByGenres(["rock"]), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.songGenres).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
