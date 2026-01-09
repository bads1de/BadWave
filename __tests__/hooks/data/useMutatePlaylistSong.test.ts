import { waitFor } from "@testing-library/react";
import useMutatePlaylistSong from "@/hooks/data/useMutatePlaylistSong";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils";

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" } }),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("hooks/data/useMutatePlaylistSong", () => {
  let mockSupabase: any;
  let mockInsert: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    mockInsert = jest.fn();
    mockDelete = jest.fn();
    
    // Mock chain for delete: delete -> eq -> eq -> eq
    const mockEq3 = { eq: () => Promise.resolve({ error: null }) };
    const mockEq2 = { eq: () => mockEq3 };
    const mockEq1 = { eq: () => mockEq2 };
    mockDelete.mockReturnValue(mockEq1);

    mockSupabase = {
      from: jest.fn(() => ({
        insert: mockInsert,
        delete: mockDelete,
        update: jest.fn(() => ({ eq: jest.fn(() => ({ eq: jest.fn() })) })), // For updateImagePath
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("adds song to playlist", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const { result } = renderHookWithQueryClient(() => useMutatePlaylistSong());

    await result.current.addPlaylistSong.mutateAsync({
      songId: "song-1",
      playlistId: "playlist-1",
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("playlist_songs");
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      playlist_id: "playlist-1",
      user_id: "user-1",
      song_id: "song-1",
    }));
  });

  it("deletes song from playlist", async () => {
    const { result } = renderHookWithQueryClient(() => useMutatePlaylistSong());

    await result.current.deletePlaylistSong.mutateAsync({
      songId: "song-1",
      playlistId: "playlist-1",
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("playlist_songs");
    expect(mockDelete).toHaveBeenCalled();
  });
});
