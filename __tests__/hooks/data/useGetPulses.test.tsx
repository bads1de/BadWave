import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetPulses from "@/hooks/data/useGetPulses";
import { createClient } from "@/libs/supabase/client";
import React from "react";
import { Pulse } from "@/types";

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

describe("useGetPulses", () => {
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
    const initialData: Pulse[] = [
      {
        id: "pulse-1",
        title: "Test Pulse",
        music_path: "/music/test.mp3",
        genre: "city pop",
      },
    ];

    const { result } = renderHook(() => useGetPulses(initialData), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    // 初期データがあるのですぐに結果が返る
    expect(result.current.pulses).toEqual(initialData);
    expect(result.current.isLoading).toBe(false);
  });

  it("should fetch pulses when no initial data provided", async () => {
    const mockOrder = jest.fn();
    const mockSelect = jest.fn(() => ({ order: mockOrder }));

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const mockData: Pulse[] = [
      {
        id: "pulse-1",
        title: "Test Pulse",
        music_path: "/music/test.mp3",
        genre: "city pop",
      },
    ];

    mockOrder.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { result } = renderHook(() => useGetPulses([]), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockSupabase.from).toHaveBeenCalledWith("pulses");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });

    expect(result.current.pulses).toEqual(mockData);
  });

  it("should handle error correctly", async () => {
    const mockOrder = jest.fn();
    const mockSelect = jest.fn(() => ({ order: mockOrder }));

    mockSupabase.from.mockReturnValue({ select: mockSelect });

    mockOrder.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const { result } = renderHook(() => useGetPulses([]), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe("Pulseの取得に失敗しました");
  });
});
