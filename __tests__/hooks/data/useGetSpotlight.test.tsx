import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetSpotlight from "@/hooks/data/useGetSpotlight";
import getSpotlight from "@/actions/getSpotlight";
import React from "react";
import { Spotlight } from "@/types";

// Mock Dependencies
jest.mock("@/actions/getSpotlight");

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

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

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
      wrapper,
    });

    // 初期データがあるのですぐに結果が返る
    expect(result.current.spotlights).toEqual(initialData);
    expect(result.current.isLoading).toBe(false);
    // 初期データがある場合は再取得しない
    expect(getSpotlight).not.toHaveBeenCalled();
  });

  it("should fetch spotlights via the server action when no initial data provided", async () => {
    const mockData: Spotlight[] = [
      {
        id: "spotlight-1",
        title: "Test Spotlight",
        video_path: "/video/test.mp4",
        author: "Test Author",
      },
    ];

    (getSpotlight as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGetSpotlight([]), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getSpotlight).toHaveBeenCalledTimes(1);
    expect(result.current.spotlights).toEqual(mockData);
  });

  it("should propagate the server action error", async () => {
    (getSpotlight as jest.Mock).mockRejectedValue(new Error("Database error"));

    const { result } = renderHook(() => useGetSpotlight([]), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe("Database error");
  });
});
