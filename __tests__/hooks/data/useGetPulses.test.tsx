import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetPulses from "@/hooks/data/useGetPulses";
import getPulses from "@/actions/getPulses";
import React from "react";
import { Pulse } from "@/types";

// Mock Dependencies
jest.mock("@/actions/getPulses");

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

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return initial data when provided", async () => {
    const initialData: Pulse[] = [
      {
        id: "pulse-1",
        title: "Test Pulse",
        music_path: "/music/test.mp3",
        genre: "city pop",
      },
    ];

    const { result } = renderHook(() => useGetPulses(initialData), { wrapper });

    // 初期データがあるのですぐに結果が返る
    expect(result.current.pulses).toEqual(initialData);
    expect(result.current.isLoading).toBe(false);
    // 初期データがある場合は再取得しない
    expect(getPulses).not.toHaveBeenCalled();
  });

  it("should fetch pulses via the server action when no initial data provided", async () => {
    const mockData: Pulse[] = [
      {
        id: "pulse-1",
        title: "Test Pulse",
        music_path: "/music/test.mp3",
        genre: "city pop",
      },
    ];

    (getPulses as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGetPulses([]), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPulses).toHaveBeenCalledTimes(1);
    expect(result.current.pulses).toEqual(mockData);
  });

  it("should propagate the server action error", async () => {
    (getPulses as jest.Mock).mockRejectedValue(new Error("Database error"));

    const { result } = renderHook(() => useGetPulses([]), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe("Database error");
  });
});
