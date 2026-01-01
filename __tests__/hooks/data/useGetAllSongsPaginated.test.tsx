import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetAllSongsPaginated from "@/hooks/data/useGetAllSongsPaginated";
// import getSongsPaginated from "@/actions/getSongsPaginated";

// 依存関係のモック
jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockGetSongsPaginated = jest.fn();

// Server Action のモック
jest.mock("@/actions/getSongsPaginated", () => ({
  __esModule: true,
  default: (...args: any[]) => mockGetSongsPaginated(...args),
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // テスト用にキャッシュを無効化
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useGetAllSongsPaginated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ページネーションデータを正しく取得する", async () => {
    const mockData = {
      songs: [
        { id: "1", title: "Song 1", author: "Artist 1" },
        { id: "2", title: "Song 2", author: "Artist 2" },
      ],
      totalCount: 50,
      totalPages: 3,
      currentPage: 0,
    };

    mockGetSongsPaginated.mockResolvedValue(mockData);

    const { result } = renderHook(() => useGetAllSongsPaginated(0, 24), {
      wrapper: createTestWrapper(),
    });

    // 初期状態はローディング
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.songs).toEqual(mockData.songs);
    expect(result.current.totalCount).toBe(50);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentPage).toBe(0);
    expect(mockGetSongsPaginated).toHaveBeenCalledWith(0, 24);
  });

  it("エラー発生時にエラーを処理する", async () => {
    mockGetSongsPaginated.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useGetAllSongsPaginated(0, 24), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.songs).toEqual([]);
  });

  it("ページパラメータが変わると再取得する", async () => {
    const mockDataPage0 = {
      songs: [{ id: "1", title: "Song 1" }],
      totalCount: 50,
      totalPages: 3,
      currentPage: 0,
    };
    const mockDataPage1 = {
      songs: [{ id: "2", title: "Song 2" }],
      totalCount: 50,
      totalPages: 3,
      currentPage: 1,
    };

    mockGetSongsPaginated
      .mockResolvedValueOnce(mockDataPage0)
      .mockResolvedValueOnce(mockDataPage1);

    const { result, rerender } = renderHook(
      ({ page }) => useGetAllSongsPaginated(page, 24),
      {
        wrapper: createTestWrapper(),
        initialProps: { page: 0 },
      }
    );

    await waitFor(() => {
      expect(result.current.songs).toEqual(mockDataPage0.songs);
    });

    // ページ変更
    rerender({ page: 1 });

    await waitFor(() => {
      expect(result.current.songs).toEqual(mockDataPage1.songs);
    });

    expect(mockGetSongsPaginated).toHaveBeenCalledWith(1, 24);
  });
});
