import { createClient } from "@/libs/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CACHED_QUERIES, TABLES } from "@/constants";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { getErrorMessage } from "@/libs/utils/error";
import {
  applyOptimisticUpdate,
  rollbackOptimisticUpdate,
} from "@/libs/query/optimistic";

/**
 * 曲のいいね操作を行うカスタムフック
 *
 * @param songId 曲のID
 * @param userId ユーザーID
 * @returns いいね操作のミューテーション
 */
const useLikeMutation = (songId: string, userId?: string) => {
  const supabaseClient = createClient();
  const queryClient = useQueryClient();
  const likeStatusKey = [CACHED_QUERIES.likeStatus, songId, userId] as const;

  return useMutation({
    mutationFn: async (isCurrentlyLiked: boolean) => {
      if (!userId) throw new Error("ユーザーIDが必要です");

      if (isCurrentlyLiked) {
        // いいねを削除
        const { error } = await supabaseClient
          .from(TABLES.LIKED_SONGS_REGULAR)
          .delete()
          .eq("user_id", userId)
          .eq("song_id", songId);

        if (error) throw error;

        // いいねカウントを減らす（RPC）
        await supabaseClient.rpc("increment_like_count", {
          song_id: songId,
          increment_value: -1,
        });
        return false;
      } else {
        // いいねを追加
        const { error } = await supabaseClient
          .from(TABLES.LIKED_SONGS_REGULAR)
          .insert({
            song_id: songId,
            user_id: userId,
          });

        if (error) throw error;

        // いいねカウントを増やす（RPC）
        await supabaseClient.rpc("increment_like_count", {
          song_id: songId,
          increment_value: 1,
        });
        return true;
      }
    },
    onMutate: async (isCurrentlyLiked: boolean) =>
      applyOptimisticUpdate<boolean>(queryClient, likeStatusKey, () =>
        !isCurrentlyLiked
      ),
    onSuccess: (newLikeStatus) => {
      // いいね状態のキャッシュを更新
      queryClient.setQueryData(likeStatusKey, newLikeStatus);

      // 曲データのキャッシュを無効化（いいねカウントが変わるため）
      queryClient.invalidateQueries({
        queryKey: [CACHED_QUERIES.songById, songId],
      });

      // トレンド曲のキャッシュを無効化（いいねカウントが変わるため）
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.trendSongs] });

      // いいね曲リストのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.likedSongs] });

      if (newLikeStatus) {
        toast.success("いいねしました！");
      }
    },
    onError: (error, _variables, context) => {
      rollbackOptimisticUpdate(queryClient, likeStatusKey, context);
      console.error("Like mutation error:", error);
      toast.error(getErrorMessage(error, ERROR_MESSAGES.GENERIC_ERROR_RETRY));
    },
  });
};

export default useLikeMutation;
