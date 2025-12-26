import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetSongById from "@/hooks/data/useGetSongById";
import { createClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";
import React from "react";

// Mock Dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("useGetSongById", () => {
  let queryClient: QueryClient;
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    queryClient = createTestQueryClient();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    mockSupabase.from.mockReset();
    jest.clearAllMocks();
  });

  it("should return undefined if id is not provided", async () => {
    const { result } = renderHook(() => useGetSongById(undefined), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    // When disabled, isLoading stays in its default state (usually false/idle in renderHook if not immediate)
    // Actually in v5 it's isPending.
    expect(result.current.song).toBeUndefined();
  });

  it("should fetch song data successfully", async () => {
    const mockMaybeSingle = jest.fn().mockResolvedValue({
      data: { id: "song-1", title: "Test Song" },
      error: null,
    });
    const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useGetSongById("song-1"), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockSupabase.from).toHaveBeenCalledWith("songs");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "song-1");
    expect(result.current.song).toEqual({ id: "song-1", title: "Test Song" });
  });

  it("should show toast error when fetch fails", async () => {
    const mockMaybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Database Error" },
    });
    const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useGetSongById("song-1"), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to load song: Database Error"
      )
    );
  });
});
