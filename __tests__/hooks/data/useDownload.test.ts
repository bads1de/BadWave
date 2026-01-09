import { renderHook, waitFor } from "@testing-library/react";
import useDownload from "@/hooks/data/useDownload";
import { renderHookWithQueryClient } from "../../test-utils";

describe("hooks/data/useDownload", () => {
  it("returns null if path is empty", async () => {
    const { result } = renderHookWithQueryClient(() => useDownload(""));
    
    // Initial fetch might be loading, but should settle to null data
    await waitFor(() => {
      expect(result.current.fileUrl).toBeUndefined(); // or null depending on useQuery behavior with enabled: false
    });
  });

  it("returns path as is if it is a http url", async () => {
    const { result } = renderHookWithQueryClient(() => 
      useDownload("https://example.com/file.mp3")
    );

    await waitFor(() => {
      expect(result.current.fileUrl).toBe("https://example.com/file.mp3");
    });
  });
});
