"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/auth/useUser";
import { createClient } from "@/libs/supabase/client";
import { uploadFile } from "@/libs/storage/upload";
import { requireAdminPermission } from "@/libs/auth/requireAdmin";
import { CACHED_QUERIES } from "@/constants";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { getErrorMessage } from "@/libs/utils/error";
import type { ModalHook } from "@/types";

interface PulseUploadParams {
  title: string;
  genre: string;
  musicFile: File | null;
}

/**
 * Pulseへの音声アップロード処理を行うカスタムフック
 *
 * @param pulseUploadModal アップロードモーダルのフック
 * @returns アップロードミューテーション
 */
const usePulseUploadMutation = (pulseUploadModal: ModalHook) => {
  const supabaseClient = createClient();
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ title, genre, musicFile }: PulseUploadParams) => {
      await requireAdminPermission();

      if (!musicFile || !user) {
        toast.error(ERROR_MESSAGES.AUDIO_FILE_REQUIRED);
        throw new Error(ERROR_MESSAGES.AUDIO_FILE_REQUIRED);
      }

      if (!title.trim()) {
        toast.error(ERROR_MESSAGES.TITLE_REQUIRED);
        throw new Error(ERROR_MESSAGES.TITLE_REQUIRED);
      }

      if (!genre.trim()) {
        toast.error(ERROR_MESSAGES.GENRE_REQUIRED);
        throw new Error(ERROR_MESSAGES.GENRE_REQUIRED);
      }

      // 音声をR2にアップロード
      let musicUrl: string | null;
      try {
        musicUrl = await uploadFile(musicFile, "pulse", "pulse");
      } catch (error) {
        toast.error(ERROR_MESSAGES.AUDIO_UPLOAD_FAILED);
        throw new Error(ERROR_MESSAGES.AUDIO_UPLOAD_FAILED);
      }

      if (!musicUrl) {
        toast.error(ERROR_MESSAGES.AUDIO_UPLOAD_FAILED);
        throw new Error(ERROR_MESSAGES.AUDIO_UPLOAD_FAILED);
      }

      // データベースにレコードを作成
      const { error } = await supabaseClient.from("pulses").insert({
        music_path: musicUrl,
        title,
        genre,
      });

      if (error) {
        toast.error(getErrorMessage(error));
        throw new Error(getErrorMessage(error));
      }

      return { title, genre };
    },
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.pulse] });

      toast.success("Pulseを投稿しました!");

      // モーダルを閉じる
      pulseUploadModal.onClose();
    },
    onError: (error: Error) => {
      console.error("Pulse upload error:", error);
      // エラーメッセージはmutationFn内で表示しているため、ここでは何もしない
    },
  });
};

export default usePulseUploadMutation;
