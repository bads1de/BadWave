import { renderHook, act, waitFor } from "@testing-library/react";
import useLikeMutation from "@/hooks/data/useLikeMutation";
import { createClient } from "@/libs/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CACHED_QUERIES } from "@/constants";
import toast from "react-hot-toast";
import React from "react";

// Mock Supabase client
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("useLikeMutation", () => {
  let queryClient: QueryClient;
  const mockRpc = jest.fn().mockResolvedValue({ error: null });
  const mockSupabase = {
    from: jest.fn(),
    rpc: mockRpc,
  };

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("should add like when isCurrentlyLiked is false", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "liked_songs_regular") {
        return { insert: mockInsert };
      }
      return {};
    });

    const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(false);
    });

    expect(mockInsert).toHaveBeenCalledWith({
      song_id: "song-1",
      user_id: "user-1",
    });
    expect(mockRpc).toHaveBeenCalledWith("increment_like_count", {
      song_id: "song-1",
      increment_value: 1,
    });
    expect(toast.success).toHaveBeenCalledWith("いいねしました！");
  });

  it("should remove like when isCurrentlyLiked is true", async () => {
    const mockEqDelete2 = jest.fn().mockResolvedValue({ error: null });
    const mockEqDelete1 = jest.fn().mockReturnValue({ eq: mockEqDelete2 });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEqDelete1 });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "liked_songs_regular") {
        return { delete: mockDelete };
      }
      return {};
    });

    const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(true);
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledWith("increment_like_count", {
      song_id: "song-1",
      increment_value: -1,
    });
  });

  it("should show error toast on failure", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: { message: "Fail" } }),
    });

    const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync(false);
      } catch (e) {}
    });

    expect(toast.error).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  describe("楽観的更新", () => {
    it("mutate呼び出し時に即座にキャッシュが更新される（いいね追加）", async () => {
      queryClient.setQueryData(
        [CACHED_QUERIES.likeStatus, "song-1", "user-1"],
        false,
      );

      // 遅延モック
      mockSupabase.from.mockImplementation(() => ({
        insert: jest.fn(
          () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)),
        ),
      }));
      mockRpc.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)),
      );

      const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(false);
      });

      // 楽観的更新: 即座にtrueに更新される
      await waitFor(() => {
        const status = queryClient.getQueryData([
          CACHED_QUERIES.likeStatus,
          "song-1",
          "user-1",
        ]);
        expect(status).toBe(true);
      });
    });

    it("mutate呼び出し時に即座にキャッシュが更新される（いいね解除）", async () => {
      queryClient.setQueryData(
        [CACHED_QUERIES.likeStatus, "song-1", "user-1"],
        true,
      );

      mockSupabase.from.mockImplementation(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(
              () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)),
            ),
          })),
        })),
      }));
      mockRpc.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)),
      );

      const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(true);
      });

      await waitFor(() => {
        const status = queryClient.getQueryData([
          CACHED_QUERIES.likeStatus,
          "song-1",
          "user-1",
        ]);
        expect(status).toBe(false);
      });
    });

    it("エラー時にキャッシュがロールバックされる", async () => {
      queryClient.setQueryData(
        [CACHED_QUERIES.likeStatus, "song-1", "user-1"],
        false,
      );

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: { message: "Fail" } }),
      });

      const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(false);
        } catch (e) {}
      });

      await waitFor(() => {
        const status = queryClient.getQueryData([
          CACHED_QUERIES.likeStatus,
          "song-1",
          "user-1",
        ]);
        expect(status).toBe(false);
      });
    });
  });
});
