import { renderHook, waitFor } from "@testing-library/react";
import {
  useUpdatePlaylistTitle,
  useTogglePlaylistPublic,
  useDeletePlaylist,
} from "@/hooks/data/usePlaylistMutations";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils";

// Mock dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
    push: jest.fn(),
  })),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" } }),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

/**
 * Supabaseクライアントのモックチェーンを作成
 * .from() -> .update()/.delete() -> .eq() -> .eq() のチェーンをサポート
 * 最終的な .eq() がエラーを返すように設定可能
 */
function createMockSupabase(options: { shouldFail?: boolean } = {}) {
  const { shouldFail = false } = options;

  // 最終的な .eq() の戻り値
  const finalResult = shouldFail
    ? { error: new Error("DB Error") }
    : { error: null };

  const mockFinalEq = jest.fn().mockResolvedValue(finalResult);
  const mockEq = jest.fn().mockReturnValue({ eq: mockFinalEq });
  const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
  const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = jest.fn().mockReturnValue({
    update: mockUpdate,
    delete: mockDelete,
  });

  return {
    from: mockFrom,
    mocks: { mockFrom, mockUpdate, mockDelete, mockEq, mockFinalEq },
  };
}

describe("hooks/data/usePlaylistMutations", () => {
  describe("useUpdatePlaylistTitle", () => {
    it("should update playlist title successfully", async () => {
      const { from } = createMockSupabase();
      (createClient as jest.Mock).mockReturnValue({ from });

      const { result } = renderHookWithQueryClient(() =>
        useUpdatePlaylistTitle()
      );

      await result.current.mutateAsync({
        playlistId: "playlist-1",
        newTitle: "New Title",
      });

      expect(from).toHaveBeenCalledWith("playlists");
    });

    it("should throw error when update fails", async () => {
      const { from } = createMockSupabase({ shouldFail: true });
      (createClient as jest.Mock).mockReturnValue({ from });

      const { result } = renderHookWithQueryClient(() =>
        useUpdatePlaylistTitle()
      );

      await expect(
        result.current.mutateAsync({
          playlistId: "playlist-1",
          newTitle: "Fail",
        })
      ).rejects.toThrow("DB Error");
    });
  });

  describe("useTogglePlaylistPublic", () => {
    it("should toggle to public when currently private", async () => {
      const { from, mocks } = createMockSupabase();
      (createClient as jest.Mock).mockReturnValue({ from });

      const { result } = renderHookWithQueryClient(() =>
        useTogglePlaylistPublic()
      );

      await result.current.mutateAsync({
        playlistId: "playlist-1",
        isPublic: false,
      });

      expect(from).toHaveBeenCalledWith("playlists");
      expect(mocks.mockUpdate).toHaveBeenCalledWith({ is_public: true });
    });

    it("should toggle to private when currently public", async () => {
      const { from, mocks } = createMockSupabase();
      (createClient as jest.Mock).mockReturnValue({ from });

      const { result } = renderHookWithQueryClient(() =>
        useTogglePlaylistPublic()
      );

      await result.current.mutateAsync({
        playlistId: "playlist-1",
        isPublic: true,
      });

      expect(mocks.mockUpdate).toHaveBeenCalledWith({ is_public: false });
    });

    it("should throw error when toggle fails", async () => {
      const { from } = createMockSupabase({ shouldFail: true });
      (createClient as jest.Mock).mockReturnValue({ from });

      const { result } = renderHookWithQueryClient(() =>
        useTogglePlaylistPublic()
      );

      await expect(
        result.current.mutateAsync({
          playlistId: "playlist-1",
          isPublic: false,
        })
      ).rejects.toThrow("DB Error");
    });
  });

  describe("useDeletePlaylist", () => {
    it("should delete playlist and playlist songs", async () => {
      const { from, mocks } = createMockSupabase();
      (createClient as jest.Mock).mockReturnValue({ from });

      const { result } = renderHookWithQueryClient(() =>
        useDeletePlaylist()
      );

      await result.current.mutateAsync({ playlistId: "playlist-1" });

      // Should delete from playlist_songs first, then playlists
      expect(from).toHaveBeenCalledWith("playlist_songs");
      expect(from).toHaveBeenCalledWith("playlists");
      expect(mocks.mockDelete).toHaveBeenCalledTimes(2);
    });
  });
});
