import { renderHook, waitFor } from "@testing-library/react";
import useGetTrendSongs from "@/hooks/data/useGetTrendSongs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

// getTrendSongsのアクションをモック
jest.mock("@/actions/getTrendSongs", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import getTrendSongs from "@/actions/getTrendSongs";

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

  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it("デフォルト期間（全体）でトレンド曲を取得するべき", async () => {
    (getTrendSongs as jest.Mock).mockResolvedValue(mockSongs);

    const { result } = renderHook(() => useGetTrendSongs(), { wrapper });

    await waitFor(() => {
      console.log("Trend Songs Result:", result.current);
      expect(result.current.trends).toEqual(mockSongs);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("特定の期間でトレンド曲を取得するべき", async () => {
    (getTrendSongs as jest.Mock).mockResolvedValue(mockSongs);

    const { result } = renderHook(() => useGetTrendSongs("month"), { wrapper });

    await waitFor(() => {
      expect(getTrendSongs).toHaveBeenCalledWith("month");
      expect(result.current.trends).toEqual(mockSongs);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("APIエラーを処理するべき", async () => {
    (getTrendSongs as jest.Mock).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useGetTrendSongs(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.trends).toEqual([]);
    });
  });
});
