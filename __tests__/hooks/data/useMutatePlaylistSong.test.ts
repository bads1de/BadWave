import { waitFor, act } from "@testing-library/react";
import useMutatePlaylistSong from "@/hooks/data/useMutatePlaylistSong";
import { createClient } from "@/libs/supabase/client";
import { CACHED_QUERIES } from "@/constants";
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
  let queryClient: any;

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

      const { result, queryClient: qc } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );
      queryClient = qc;

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

  describe("楽観的更新", () => {
    it("addPlaylistSong時にキャッシュが即座に更新される", async () => {
      const { result, queryClient: qc } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );
      queryClient = qc;

      const initialSongs = [
        { id: "existing-song", playlist_id: "playlist-1" },
      ];
      queryClient.setQueryData(
        [CACHED_QUERIES.playlists, "playlist-1", "songs"],
        initialSongs,
      );

      mockInsert.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100)),
      );

      act(() => {
        result.current.addPlaylistSong.mutate({
          songId: "new-song",
          playlistId: "playlist-1",
        });
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData<any[]>([
          CACHED_QUERIES.playlists,
          "playlist-1",
          "songs",
        ]);
        expect(cached).toHaveLength(2);
        expect(cached![1]).toMatchObject({
          id: "new-song",
          playlist_id: "playlist-1",
        });
      });
    });

    it("addPlaylistSong失敗時にキャッシュがロールバックされる", async () => {
      const { result, queryClient: qc } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );
      queryClient = qc;

      const initialSongs = [
        { id: "existing-song", playlist_id: "playlist-1" },
      ];
      queryClient.setQueryData(
        [CACHED_QUERIES.playlists, "playlist-1", "songs"],
        initialSongs,
      );

      mockInsert.mockResolvedValue({ error: new Error("Insert failed") });

      await act(async () => {
        await result.current.addPlaylistSong.mutateAsync({
          songId: "new-song",
          playlistId: "playlist-1",
        }).catch(() => {});
      });

      const cached = queryClient.getQueryData<any[]>([
        CACHED_QUERIES.playlists,
        "playlist-1",
        "songs",
      ]);
      expect(cached).toEqual(initialSongs);
    });

    it("deletePlaylistSong時にキャッシュが即座に更新される", async () => {
      const { result, queryClient: qc } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );
      queryClient = qc;

      const initialSongs = [
        { id: "song-to-delete", playlist_id: "playlist-1" },
        { id: "song-to-keep", playlist_id: "playlist-1" },
      ];
      queryClient.setQueryData(
        [CACHED_QUERIES.playlists, "playlist-1", "songs"],
        initialSongs,
      );

      const mockEq3 = { eq: jest.fn().mockResolvedValue({ error: null }) };
      const mockEq2 = { eq: jest.fn().mockReturnValue(mockEq3) };
      const mockEq1 = { eq: jest.fn().mockReturnValue(mockEq2) };
      mockDelete.mockReturnValue(mockEq1);

      act(() => {
        result.current.deletePlaylistSong.mutate({
          songId: "song-to-delete",
          playlistId: "playlist-1",
        });
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData<any[]>([
          CACHED_QUERIES.playlists,
          "playlist-1",
          "songs",
        ]);
        expect(cached).toHaveLength(1);
        expect(cached![0].id).toBe("song-to-keep");
      });
    });

    it("deletePlaylistSong失敗時にキャッシュがロールバックされる", async () => {
      const { result, queryClient: qc } = renderHookWithQueryClient(() =>
        useMutatePlaylistSong()
      );
      queryClient = qc;

      const initialSongs = [
        { id: "song-to-delete", playlist_id: "playlist-1" },
        { id: "song-to-keep", playlist_id: "playlist-1" },
      ];
      queryClient.setQueryData(
        [CACHED_QUERIES.playlists, "playlist-1", "songs"],
        initialSongs,
      );

      const mockEq3 = { eq: jest.fn().mockResolvedValue({ error: new Error("Delete failed") }) };
      const mockEq2 = { eq: jest.fn().mockReturnValue(mockEq3) };
      const mockEq1 = { eq: jest.fn().mockReturnValue(mockEq2) };
      mockDelete.mockReturnValue(mockEq1);

      await act(async () => {
        await result.current.deletePlaylistSong.mutateAsync({
          songId: "song-to-delete",
          playlistId: "playlist-1",
        }).catch(() => {});
      });

      const cached = queryClient.getQueryData<any[]>([
        CACHED_QUERIES.playlists,
        "playlist-1",
        "songs",
      ]);
      expect(cached).toEqual(initialSongs);
    });
  });
});
