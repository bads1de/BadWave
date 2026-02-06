import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useStats from "@/hooks/data/useStats";
import { getListeningStats } from "@/actions/getStats";
import React from "react";

// Mock Dependencies
jest.mock("@/actions/getStats", () => ({
  getListeningStats: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("useStats", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it("should fetch stats correctly", async () => {
    const mockStats = {
      total_plays: 10,
      total_play_time_minutes: 30,
      favorite_genres: [],
      most_played_songs: [],
      hourly_activity: [],
    };

    (getListeningStats as jest.Mock).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useStats("week"), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getListeningStats).toHaveBeenCalledWith("week");
    expect(result.current.stats).toEqual(mockStats);
  });

  it("should handle errors", async () => {
    (getListeningStats as jest.Mock).mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useStats("month"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.stats).toBeUndefined();
  });
});
