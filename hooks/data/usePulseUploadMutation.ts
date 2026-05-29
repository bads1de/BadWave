"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/auth/useUser";
import { createClient } from "@/libs/supabase/client";
import { uploadFile } from "@/libs/storage/upload";
import { requireAdminPermission } from "@/libs/auth/requireAdmin";
import { CACHED_QUERIES } from "@/constants";
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
        toast.error("音声ファイルを選択してください");
        throw new Error("音声ファイルを選択してください");
      }

      if (!title.trim()) {
        toast.error("タイトルを入力してください");
        throw new Error("タイトルを入力してください");
      }

      if (!genre.trim()) {
        toast.error("ジャンルを入力してください");
        throw new Error("ジャンルを入力してください");
      }

      // 音声をR2にアップロード
      let musicUrl: string | null;
      try {
        musicUrl = await uploadFile(musicFile, "pulse", "pulse");
      } catch (error) {
        toast.error("音声のアップロードに失敗しました");
        throw new Error("音声のアップロードに失敗しました");
      }

      if (!musicUrl) {
        toast.error("音声のアップロードに失敗しました");
        throw new Error("音声のアップロードに失敗しました");
      }

      // データベースにレコードを作成
      const { error } = await supabaseClient.from("pulses").insert({
        music_path: musicUrl,
        title,
        genre,
      });

      if (error) {
        toast.error(error.message);
        throw new Error(error.message);
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
