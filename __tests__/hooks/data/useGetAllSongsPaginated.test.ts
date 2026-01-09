import { renderHook, waitFor } from "@testing-library/react";
import useGetAllSongsPaginated from "@/hooks/data/useGetAllSongsPaginated";
import getSongsPaginated from "@/actions/getSongsPaginated";
import { renderHookWithQueryClient } from "../../test-utils";

jest.mock("@/actions/getSongsPaginated");

describe("hooks/data/useGetAllSongsPaginated", () => {
  it("fetches paginated songs", async () => {
    const mockData = {
      songs: [{ id: "1", title: "Song 1" }],
      totalCount: 10,
      totalPages: 1,
      currentPage: 0,
    };

    (getSongsPaginated as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHookWithQueryClient(() => 
      useGetAllSongsPaginated(0, 10)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.songs).toEqual(mockData.songs);
    expect(result.current.totalCount).toBe(10);
    expect(getSongsPaginated).toHaveBeenCalledWith(0, 10);
  });

  it("handles loading state", () => {
    (getSongsPaginated as jest.Mock).mockReturnValue(new Promise(() => {})); // Pending

    const { result } = renderHookWithQueryClient(() => 
      useGetAllSongsPaginated(0, 10)
    );

    expect(result.current.isLoading).toBe(true);
  });
});
