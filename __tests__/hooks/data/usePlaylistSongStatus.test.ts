import { renderHook, waitFor } from "@testing-library/react";
import usePlaylistSongStatus from "@/hooks/data/usePlaylistSongStatus";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils";

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" } }),
}));

describe("hooks/data/usePlaylistSongStatus", () => {
  let mockSupabase: any;
  let mockIn: jest.Mock;

  beforeEach(() => {
    mockIn = jest.fn();
    // select -> eq -> eq -> in
    const mockEq2 = { in: mockIn };
    const mockEq1 = { eq: () => mockEq2 };
    const mockSelect = jest.fn(() => ({ eq: () => mockEq1 }));

    mockSupabase = {
      from: jest.fn(() => ({
        select: mockSelect,
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("returns status for playlists", async () => {
    // Mock response: song is in playlist-1, not in playlist-2
    mockIn.mockResolvedValue({ 
      data: [{ playlist_id: "playlist-1" }], 
      error: null 
    });

    const playlists = [{ id: "playlist-1" }, { id: "playlist-2" }];
    const { result } = renderHookWithQueryClient(() => 
      usePlaylistSongStatus("song-1", playlists)
    );

    await waitFor(() => {
      expect(result.current.isInPlaylist).toEqual({
        "playlist-1": true,
        "playlist-2": false,
      });
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("playlist_songs");
    expect(mockIn).toHaveBeenCalledWith("playlist_id", ["playlist-1", "playlist-2"]);
  });

  it("returns empty if no playlists provided", async () => {
    const { result } = renderHookWithQueryClient(() => 
      usePlaylistSongStatus("song-1", [])
    );

    await waitFor(() => {
      expect(result.current.isInPlaylist).toEqual({});
    });
    
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
});
