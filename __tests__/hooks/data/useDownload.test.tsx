import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useDownload from "@/hooks/data/useDownload";
import React from "react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("useDownload", () => {
  it("should return the original URL if it starts with http", async () => {
    const queryClient = createTestQueryClient();
    const url = "https://example.com/music.mp3";

    const { result } = renderHook(() => useDownload(url), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.fileUrl).toBe(url);
  });

  it("should return null if path is empty", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useDownload(""), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    // If path is empty, enabled is false, so it stays in initial state.
    expect(result.current.fileUrl).toBeUndefined(); // or null if defined in hook
  });
});
