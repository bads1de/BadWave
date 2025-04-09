import { renderHook, waitFor } from "@testing-library/react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import useGetTopPlayedSongs from "@/hooks/data/useGetTopPlayedSongs";

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: jest.fn(),
}));

const mockTopSongs = [
  {
    id: "1",
    title: "Most Played Song",
    author: "Artist 1",
    play_count: 10,
    song_path: "path/to/song1.mp3",
    image_path: "path/to/image1.jpg",
    user_id: "user1",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Second Most Played",
    author: "Artist 2",
    play_count: 8,
    song_path: "path/to/song2.mp3",
    image_path: "path/to/image2.jpg",
    user_id: "user1",
    created_at: new Date().toISOString(),
  },
];

describe("useGetTopPlayedSongs", () => {
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
  });

  it("ユーザーIDが提供されていない場合、空の配列を返すべき", async () => {
    const { result } = renderHook(() => useGetTopPlayedSongs(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.topSongs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it("デフォルト期間（日）で最も再生された曲を取得するべき", async () => {
    const mockSupabase = {
      rpc: jest.fn().mockImplementation(() => ({
        data: mockTopSongs,
        error: null,
      })),
    };

    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useGetTopPlayedSongs("test-user-id"), {
      wrapper,
    });

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_top_played_songs", {
        user_id_param: "test-user-id",
        period_param: "day",
        limit_param: 3,
      });
      expect(result.current.topSongs).toEqual(mockTopSongs);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it("指定された期間で最も再生された曲を取得するべき", async () => {
    const mockSupabase = {
      rpc: jest.fn().mockImplementation(() => ({
        data: mockTopSongs,
        error: null,
      })),
    };

    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(
      () => useGetTopPlayedSongs("test-user-id", "week"),
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_top_played_songs", {
        user_id_param: "test-user-id",
        period_param: "week",
        limit_param: 3,
      });
      expect(result.current.topSongs).toEqual(mockTopSongs);
    });
  });

  it("APIエラーを処理するべき", async () => {
    const mockError = new Error("APIエラー");
    const mockSupabase = {
      rpc: jest.fn().mockImplementation(() => ({
        data: null,
        error: mockError,
      })),
    };

    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useGetTopPlayedSongs("test-user-id"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.topSongs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
