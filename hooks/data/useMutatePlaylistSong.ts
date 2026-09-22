import { createClient } from "@/libs/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CACHED_QUERIES, TABLES } from "@/constants";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { getErrorMessage } from "@/libs/utils/error";
import { useUser } from "@/hooks/auth/useUser";
import { useRouter } from "next/navigation";
import {
  applyOptimisticUpdate,
  rollbackOptimisticUpdate,
} from "@/libs/query/optimistic";
import { Song } from "@/types";

/** プレイリスト一覧のクエリキー */
const PLAYLISTS_QUERY_KEY = [CACHED_QUERIES.playlists] as const;

/** プレイリスト内の曲一覧のクエリキー */
const playlistSongsKey = (playlistId: string) =>
  [CACHED_QUERIES.playlists, playlistId, "songs"] as const;

/**
 * プレイリスト曲の操作（追加・削除）を行うカスタムフック
 *
 * @returns プレイリスト曲の操作関数
 */
const useMutatePlaylistSong = () => {
  const supabaseClient = createClient();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const router = useRouter();

  /**
   * プレイリストから曲を削除するミューテーション
   */
  const deletePlaylistSong = useMutation({
    mutationFn: async ({
      songId,
      playlistId,
    }: {
      songId: string;
      playlistId: string;
    }) => {
      if (!user?.id) {
        throw new Error("ユーザーが認証されていません");
      }

      const { error } = await supabaseClient
        .from(TABLES.PLAYLIST_SONGS)
        .delete()
        .eq("playlist_id", playlistId)
        .eq("user_id", user.id)
        .eq("song_id", songId);

      if (error) {
        throw new Error(
          `プレイリストから曲の削除に失敗しました: ${getErrorMessage(error)}`
        );
      }

      return { songId, playlistId };
    },
    onMutate: ({ songId, playlistId }) =>
      applyOptimisticUpdate<Song[]>(
        queryClient,
        playlistSongsKey(playlistId),
        (old) => (old || []).filter((s) => s.id !== songId),
      ),
    onSuccess: (_data, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: playlistSongsKey(playlistId) });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      toast.success("プレイリストから曲が削除されました！");
      router.refresh();
    },
    onError: (error: Error, { playlistId }, context) => {
      rollbackOptimisticUpdate(
        queryClient,
        playlistSongsKey(playlistId),
        context,
      );
      console.error("Error deleting song from playlist:", error);
      toast.error(getErrorMessage(error, ERROR_MESSAGES.PLAYLIST_DELETE_SONG_FAILED));
    },
  });

  /**
   * プレイリストに曲を追加するミューテーション
   */
  const addPlaylistSong = useMutation({
    mutationFn: async ({
      songId,
      playlistId,
      songType = "regular",
      updateImagePath,
    }: {
      songId: string;
      playlistId: string;
      songType?: "regular";
      updateImagePath?: string;
    }) => {
      if (!user?.id) {
        throw new Error("ユーザーが認証されていません");
      }

      // プレイリストに曲を追加
      const { error } = await supabaseClient.from(TABLES.PLAYLIST_SONGS).insert({
        playlist_id: playlistId,
        user_id: user.id,
        song_id: songId,
        song_type: songType,
      });

      if (error) {
        throw new Error(
          `プレイリストへの曲の追加に失敗しました: ${getErrorMessage(error)}`
        );
      }

      // プレイリストの画像を更新する必要がある場合
      if (updateImagePath) {
        const { error: updateError } = await supabaseClient
          .from(TABLES.PLAYLISTS)
          .update({ image_path: updateImagePath })
          .eq("id", playlistId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("プレイリスト画像の更新エラー:", updateError);
          // 画像更新のエラーは致命的ではないので、例外は投げない
        }
      }

      return { songId, playlistId };
    },
    onMutate: ({ songId, playlistId }) =>
      applyOptimisticUpdate<Song[]>(
        queryClient,
        playlistSongsKey(playlistId),
        (old) => [
          ...(old || []),
          { id: songId, playlist_id: playlistId } as unknown as Song,
        ],
      ),
    onSuccess: (_data, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: playlistSongsKey(playlistId) });
      queryClient.invalidateQueries({ queryKey: PLAYLISTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [CACHED_QUERIES.playlistSongStatus],
      });
      toast.success("プレイリストに曲が追加されました！");
    },
    onError: (error: Error, { playlistId }, context) => {
      rollbackOptimisticUpdate(
        queryClient,
        playlistSongsKey(playlistId),
        context,
      );
      console.error("Error adding song to playlist:", error);
      toast.error(getErrorMessage(error, ERROR_MESSAGES.PLAYLIST_ADD_SONG_FAILED));
    },
  });

  return {
    deletePlaylistSong,
    addPlaylistSong,
  };
};

export default useMutatePlaylistSong;
