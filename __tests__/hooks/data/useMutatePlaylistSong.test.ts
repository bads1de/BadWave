import { waitFor } from "@testing-library/react";
import useMutatePlaylistSong from "@/hooks/data/useMutatePlaylistSong";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils";

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

const mockUseUser = jest.fn();
jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => mockUseUser(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  success: jest.fn(),
  error: jest.fn(),
}));

import toast from "react-hot-toast";

describe("hooks/data/useMutatePlaylistSong", () => {
  let mockSupabase: any;
  let mockInsert: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: { id: "user-1" } });

    mockInsert = jest.fn();
    mockDelete = jest.fn();

    // Mock chain for delete: delete -> eq -> eq -> eq
    const mockEq3 = { eq: jest.fn().mockResolvedValue({ error: null }) };
    const mockEq2 = { eq: jest.fn().mockReturnValue(mockEq3) };
    const mockEq1 = { eq: jest.fn().mockReturnValue(mockEq2) };
    mockDelete.mockReturnValue(mockEq1);

    mockSupabase = {
      from: jest.fn(() => ({
        insert: mockInsert,
        delete: mockDelete,
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        })),
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("addPlaylistSong", () => {
    it("adds song to playlist successfully", async () => {
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      await result.current.addPlaylistSong.mutateAsync({
        songId: "song-1",
        playlistId: "playlist-1",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("playlist_songs");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          playlist_id: "playlist-1",
          user_id: "user-1",
          song_id: "song-1",
        })
      );
    });

    it("throws error when user is not authenticated", async () => {
      mockUseUser.mockReturnValue({ user: null });

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      await expect(
        result.current.addPlaylistSong.mutateAsync({
          songId: "song-1",
          playlistId: "playlist-1",
        })
      ).rejects.toThrow("ユーザーが認証されていません");
    });

    it("throws error when supabase insert fails", async () => {
      mockInsert.mockResolvedValue({ error: new Error("Insert error") });

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      await expect(
        result.current.addPlaylistSong.mutateAsync({
          songId: "song-1",
          playlistId: "playlist-1",
        })
      ).rejects.toThrow("プレイリストへの曲の追加に失敗しました: Insert error");
    });

    it("updates playlist image when updateImagePath is provided", async () => {
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      await result.current.addPlaylistSong.mutateAsync({
        songId: "song-1",
        playlistId: "playlist-1",
        updateImagePath: "new-image-path",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("playlists");
    });

    it("continues when playlist image update fails (non-fatal)", async () => {
      mockInsert.mockResolvedValue({ error: null });
      mockSupabase.from = jest.fn(() => ({
        insert: mockInsert,
        delete: mockDelete,
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({
              error: new Error("Image update error"),
            }),
          })),
        })),
      }));

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      // Should not throw - image update failure is non-fatal
      await expect(
        result.current.addPlaylistSong.mutateAsync({
          songId: "song-1",
          playlistId: "playlist-1",
          updateImagePath: "new-image-path",
        })
      ).resolves.toBeDefined();
    });
  });

  describe("deletePlaylistSong", () => {
    it("deletes song from playlist successfully", async () => {
      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      await result.current.deletePlaylistSong.mutateAsync({
        songId: "song-1",
        playlistId: "playlist-1",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("playlist_songs");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("throws error when user is not authenticated", async () => {
      mockUseUser.mockReturnValue({ user: null });

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      await expect(
        result.current.deletePlaylistSong.mutateAsync({
          songId: "song-1",
          playlistId: "playlist-1",
        })
      ).rejects.toThrow("ユーザーが認証されていません");
    });

    it("throws error when supabase delete fails", async () => {
      const mockEq3 = { eq: jest.fn().mockResolvedValue({ error: new Error("Delete error") }) };
      const mockEq2 = { eq: jest.fn().mockReturnValue(mockEq3) };
      const mockEq1 = { eq: jest.fn().mockReturnValue(mockEq2) };
      mockDelete.mockReturnValue(mockEq1);

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      await expect(
        result.current.deletePlaylistSong.mutateAsync({
          songId: "song-1",
          playlistId: "playlist-1",
        })
      ).rejects.toThrow("プレイリストから曲の削除に失敗しました: Delete error");
    });
  });

  describe("Error callbacks", () => {
    it("calls onError when deletePlaylistSong fails", async () => {
      const mockEq3 = { eq: jest.fn().mockResolvedValue({ error: new Error("Delete error") }) };
      const mockEq2 = { eq: jest.fn().mockReturnValue(mockEq3) };
      const mockEq1 = { eq: jest.fn().mockReturnValue(mockEq2) };
      mockDelete.mockReturnValue(mockEq1);

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      result.current.deletePlaylistSong.mutate({
        songId: "song-1",
        playlistId: "playlist-1",
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("calls onError when addPlaylistSong fails", async () => {
      mockInsert.mockResolvedValue({ error: new Error("Insert error") });

      const { result } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );

      result.current.addPlaylistSong.mutate({
        songId: "song-1",
        playlistId: "playlist-1",
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });
});
