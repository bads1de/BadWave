import { renderHook, waitFor } from "@testing-library/react";
import useGetSongById from "@/hooks/data/useGetSongById";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSessionContext } from "@supabase/auth-helpers-react";
import * as React from "react";
import toast from "react-hot-toast";

jest.mock("@supabase/auth-helpers-react", () => ({
  useSessionContext: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

const mockSong = {
  id: "test-id",
  title: "テスト曲",
  artist: "テストアーティスト",
};

describe("useGetSongById", () => {
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

    (useSessionContext as jest.Mock).mockImplementation(() => ({
      supabaseClient: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () => ({
                data: mockSong,
                error: null,
              }),
            }),
          }),
        }),
      },
    }));
  });

  it("IDが提供されていない場合、undefinedを返すべき", async () => {
    const { result } = renderHook(() => useGetSongById(), { wrapper });

    await waitFor(() => {
      expect(result.current.song).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("曲データを取得して返すべき", async () => {
    const { result } = renderHook(() => useGetSongById("test-id"), { wrapper });

    await waitFor(() => {
      expect(result.current.song).toEqual(mockSong);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("APIからのエラーを処理するべき", async () => {
    const mockError = { message: "APIエラー" };
    (useSessionContext as jest.Mock).mockImplementation(() => ({
      supabaseClient: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () => ({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      },
    }));

    const { result } = renderHook(() => useGetSongById("test-id"), { wrapper });

    await waitFor(() => {
      expect(result.current.song).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        `Failed to load song: ${mockError.message}`
      );
    });
  });
});
