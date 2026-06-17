"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/auth/useUser";
import { createClient } from "@/libs/supabase/client";
import { uploadFile } from "@/libs/storage/upload";
import { requireAdminPermission } from "@/libs/auth/requireAdmin";
import { CACHED_QUERIES, TABLES } from "@/constants";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { getErrorMessage } from "@/libs/utils/error";
import type { ModalHook } from "@/types";

interface SpotlightUploadParams {
  title: string;
  author: string;
  genre: string;
  description: string;
  videoFile: File | null;
}

/**
 * Spotlightへの動画アップロード処理を行うカスタムフック
 *
 * @param spotlightUploadModal アップロードモーダルのフック
 * @returns アップロードミューテーション
 */
const useSpotlightUploadMutation = (
  spotlightUploadModal: ModalHook
) => {
  const supabaseClient = createClient();
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({
      title,
      author,
      genre,
      description,
      videoFile,
    }: SpotlightUploadParams) => {
      await requireAdminPermission();

      if (!videoFile || !user) {
        toast.error(ERROR_MESSAGES.VIDEO_FILE_REQUIRED);
        throw new Error(ERROR_MESSAGES.VIDEO_FILE_REQUIRED);
      }

      // 動画をR2にアップロード
      let videoUrl: string | null;
      try {
        videoUrl = await uploadFile(videoFile, "spotlight", "spotlight");
      } catch (error) {
        toast.error(ERROR_MESSAGES.VIDEO_UPLOAD_FAILED);
        throw new Error(ERROR_MESSAGES.VIDEO_UPLOAD_FAILED);
      }

      if (!videoUrl) {
        toast.error(ERROR_MESSAGES.VIDEO_UPLOAD_FAILED);
        throw new Error(ERROR_MESSAGES.VIDEO_UPLOAD_FAILED);
      }

      // データベースにレコードを作成
      const { error } = await supabaseClient.from(TABLES.SPOTLIGHTS).insert({
        video_path: videoUrl,
        title,
        author,
        genre,
        description,
        user_id: user.id,
      });

      if (error) {
        toast.error(getErrorMessage(error));
        throw new Error(getErrorMessage(error));
      }

      return { title, author };
    },
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.spotlight] });

      toast.success("Spotlightに投稿しました!");

      // モーダルを閉じる
      spotlightUploadModal.onClose();
    },
    onError: (error: Error) => {
      console.error("Spotlight upload error:", error);
      // エラーメッセージはmutationFn内で表示しているため、ここでは何もしない
    },
  });
};

export default useSpotlightUploadMutation;
