import { renderHook, waitFor } from "@testing-library/react";
import useLikeStatus from "@/hooks/data/useLikeStatus";
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

describe("useLikeStatus", () => {
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

  it("should return false if userId is not provided", async () => {
    const { result } = renderHook(() => useLikeStatus("song-1"), { wrapper });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.isLoading).toBe(false); // Because enabled: !!userId
  });

  it("should return true if liked record exists", async () => {
    const mockMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: { id: 1 }, error: null });
    const mockEq2 = jest.fn().mockReturnThis();
    const mockEq1 = jest
      .fn()
      .mockReturnValue({ eq: mockEq2, maybeSingle: mockMaybeSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLikeStatus("song-1", "user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isLiked).toBe(true);
  });

  it("should return false if liked record does not exist", async () => {
    const mockMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const mockEq2 = jest.fn().mockReturnThis();
    const mockEq1 = jest
      .fn()
      .mockReturnValue({ eq: mockEq2, maybeSingle: mockMaybeSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLikeStatus("song-1", "user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isLiked).toBe(false);
  });

  it("should throw error if fetching fails", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockMaybeSingle = jest
      .fn()
      .mockResolvedValue({
        data: null,
        error: { code: "123", message: "Error" },
      });
    const mockEq2 = jest.fn().mockReturnThis();
    const mockEq1 = jest
      .fn()
      .mockReturnValue({ eq: mockEq2, maybeSingle: mockMaybeSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLikeStatus("song-1", "user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe(
      "いいねの状態の取得に失敗しました"
    );
    consoleSpy.mockRestore();
  });
});
