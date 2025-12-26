import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetSpotlight from "@/hooks/data/useGetSpotlight";
import { createClient } from "@/libs/supabase/client";
import React from "react";
import { Spotlight } from "@/types";

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

describe("useGetSpotlight", () => {
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

  it("should return initial data when provided", async () => {
    const initialData: Spotlight[] = [
      {
        id: "spotlight-1",
        title: "Test Spotlight",
        video_path: "/video/test.mp4",
        author: "Test Author",
      },
    ];

    const { result } = renderHook(() => useGetSpotlight(initialData), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    // 初期データがあるのですぐに結果が返る
    expect(result.current.spotlights).toEqual(initialData);
    expect(result.current.isLoading).toBe(false);
  });

  it("should fetch spotlights when no initial data provided", async () => {
    const mockOrder = jest.fn();
    const mockSelect = jest.fn(() => ({ order: mockOrder }));

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const mockData: Spotlight[] = [
      {
        id: "spotlight-1",
        title: "Test Spotlight",
        video_path: "/video/test.mp4",
        author: "Test Author",
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { result } = renderHook(() => useGetSpotlight([]), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockSupabase.from).toHaveBeenCalledWith("spotlights");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });

    expect(result.current.spotlights).toEqual(mockData);
  });

  it("should handle error correctly", async () => {
    const mockOrder = jest.fn();
    const mockSelect = jest.fn(() => ({ order: mockOrder }));

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    mockOrder.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const { result } = renderHook(() => useGetSpotlight([]), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe(
      "スポットライトの取得に失敗しました"
    );
  });
});
