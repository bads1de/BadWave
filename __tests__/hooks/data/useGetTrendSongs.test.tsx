import { renderHook, waitFor } from "@testing-library/react";
import useGetTrendSongs from "@/hooks/data/useGetTrendSongs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import * as React from "react";

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: jest.fn(),
}));

const mockSongs = [
  { id: "1", title: "曲1", count: 100 },
  { id: "2", title: "曲2", count: 80 },
];

describe("useGetTrendSongs", () => {
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

  const createMockSupabaseClient = (
    returnData = mockSongs,
    shouldError = false
  ) => {
    const filterMock = jest.fn().mockReturnThis();
    const selectMock = jest.fn().mockReturnThis();
    const orderMock = jest.fn().mockReturnThis();
    const limitMock = jest
      .fn()
      .mockResolvedValue(
        shouldError
          ? { data: null, error: { message: "Database error" } }
          : { data: returnData }
      );

    return {
      from: () => ({
        select: () => ({
          filter: filterMock,
          order: orderMock,
          limit: limitMock,
        }),
      }),
      mockFunctions: {
        filter: filterMock,
        select: selectMock,
        order: orderMock,
        limit: limitMock,
      },
    };
  };

  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it("デフォルト期間（全体）でトレンド曲を取得するべき", async () => {
    const mockClient = createMockSupabaseClient();
    (createClientComponentClient as jest.Mock).mockImplementation(
      () => mockClient
    );

    const { result } = renderHook(() => useGetTrendSongs(), { wrapper });

    await waitFor(() => {
      expect(result.current.trends).toEqual(mockSongs);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("特定の期間でトレンド曲を取得するべき", async () => {
    const mockClient = createMockSupabaseClient();
    (createClientComponentClient as jest.Mock).mockImplementation(
      () => mockClient
    );

    const { result } = renderHook(() => useGetTrendSongs("month"), { wrapper });

    await waitFor(() => {
      expect(result.current.trends).toEqual(mockSongs);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("APIエラーを処理するべき", async () => {
    const mockClient = createMockSupabaseClient([], true);
    (createClientComponentClient as jest.Mock).mockImplementation(
      () => mockClient
    );

    const { result } = renderHook(() => useGetTrendSongs(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.trends).toEqual([]);
    });
  });
});
