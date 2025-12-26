import { renderHook, act, waitFor } from "@testing-library/react";
import useLikeMutation from "@/hooks/data/useLikeMutation";
import { createClient } from "@/libs/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
      },
    },
  });

describe("useLikeMutation", () => {
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

  it("should add like when isCurrentlyLiked is false", async () => {
    // Mock liked_songs_regular insert
    const mockInsert = jest.fn().mockResolvedValue({ error: null });

    // Mock songs fetch for updateLikeCount
    const mockSingle = jest
      .fn()
      .mockResolvedValue({ data: { like_count: 10 }, error: null });
    const mockEqFetch = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEqFetch });

    // Mock songs update
    const mockUpdate = jest
      .fn()
      .mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "liked_songs_regular") {
        return { insert: mockInsert };
      }
      if (table === "songs") {
        return { select: mockSelect, update: mockUpdate };
      }
      return {};
    });

    const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(false);
    });

    expect(mockInsert).toHaveBeenCalledWith({
      song_id: "song-1",
      user_id: "user-1",
    });
    expect(mockUpdate).toHaveBeenCalledWith({ like_count: 11 });
    expect(toast.success).toHaveBeenCalledWith("いいねしました！");
  });

  it("should remove like when isCurrentlyLiked is true", async () => {
    // Mock liked_songs_regular delete
    const mockEqDelete2 = jest.fn().mockResolvedValue({ error: null });
    const mockEqDelete1 = jest.fn().mockReturnValue({ eq: mockEqDelete2 });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEqDelete1 });

    // Mock songs fetch for updateLikeCount
    const mockSingle = jest
      .fn()
      .mockResolvedValue({ data: { like_count: 10 }, error: null });
    const mockEqFetch = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEqFetch });

    // Mock songs update
    const mockUpdate = jest
      .fn()
      .mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "liked_songs_regular") {
        return { delete: mockDelete };
      }
      if (table === "songs") {
        return { select: mockSelect, update: mockUpdate };
      }
      return {};
    });

    const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(true);
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith({ like_count: 9 });
  });

  it("should show error toast on failure", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: { message: "Fail" } }),
    });

    const { result } = renderHook(() => useLikeMutation("song-1", "user-1"), {
      wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync(false);
      } catch (e) {}
    });

    expect(toast.error).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
