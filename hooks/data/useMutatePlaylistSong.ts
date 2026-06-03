import { createClient } from "@/libs/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CACHED_QUERIES } from "@/constants";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { getErrorMessage } from "@/libs/utils/error";
import { useUser } from "@/hooks/auth/useUser";
import { useRouter } from "next/navigation";
import { Song } from "@/types";

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
        .from("playlist_songs")
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
    onMutate: async ({ songId, playlistId }) => {
      await queryClient.cancelQueries({
        queryKey: [CACHED_QUERIES.playlists, playlistId, "songs"],
      });

      const previousSongs = queryClient.getQueryData<Song[]>([
        CACHED_QUERIES.playlists,
        playlistId,
        "songs",
      ]);

      queryClient.setQueryData<Song[]>(
        [CACHED_QUERIES.playlists, playlistId, "songs"],
        (old) => (old || []).filter((s) => s.id !== songId),
      );

      return { previousSongs, playlistId };
    },
    onSuccess: (_data, { playlistId }) => {
      queryClient.invalidateQueries({
        queryKey: [CACHED_QUERIES.playlists, playlistId, "songs"],
      });
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      toast.success("プレイリストから曲が削除されました！");
      router.refresh();
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSongs !== undefined) {
        queryClient.setQueryData(
          [CACHED_QUERIES.playlists, context.playlistId, "songs"],
          context.previousSongs,
        );
      }
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
      const { error } = await supabaseClient.from("playlist_songs").insert({
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
          .from("playlists")
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
    onMutate: async ({ songId, playlistId }) => {
      await queryClient.cancelQueries({
        queryKey: [CACHED_QUERIES.playlists, playlistId, "songs"],
      });

      const previousSongs = queryClient.getQueryData<Song[]>([
        CACHED_QUERIES.playlists,
        playlistId,
        "songs",
      ]);

      queryClient.setQueryData<Song[]>(
        [CACHED_QUERIES.playlists, playlistId, "songs"],
        (old) => [
          ...(old || []),
          { id: songId, playlist_id: playlistId } as unknown as Song,
        ],
      );

      return { previousSongs, playlistId };
    },
    onSuccess: (_data, { playlistId }) => {
      queryClient.invalidateQueries({
        queryKey: [CACHED_QUERIES.playlists, playlistId, "songs"],
      });
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.playlists] });
      queryClient.invalidateQueries({
        queryKey: [CACHED_QUERIES.playlistSongStatus],
      });
      toast.success("プレイリストに曲が追加されました！");
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSongs !== undefined) {
        queryClient.setQueryData(
          [CACHED_QUERIES.playlists, context.playlistId, "songs"],
          context.previousSongs,
        );
      }
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
