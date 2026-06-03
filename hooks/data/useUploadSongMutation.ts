"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import { createClient } from "@/libs/supabase/client";
import { sanitizeTitle } from "@/libs/utils/utils";
import { uploadFile } from "@/libs/storage/upload";
import { requireAdminPermission } from "@/libs/auth/requireAdmin";
import { serializeGenres } from "@/libs/song/songUtils";
import uniqid from "uniqid";
import { CACHED_QUERIES } from "@/constants";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { getErrorMessage } from "@/libs/utils/error";
import type { ModalHook } from "@/types";

interface UploadSongParams {
  title: string;
  author: string;
  lyrics: string;
  genre: string[];
  songFile: File | null;
  imageFile: File | null;
}

/**
 * 曲のアップロード処理を行うカスタムフック
 *
 * @param uploadModal アップロードモーダルのフック
 * @returns アップロードミューテーション
 */
const useUploadSongMutation = (uploadModal: ModalHook) => {
  const supabaseClient = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();
  return useMutation({
    mutationFn: async ({
      title,
      author,
      lyrics,
      genre,
      songFile,
      imageFile,
    }: UploadSongParams) => {
      await requireAdminPermission();

      if (!songFile || !imageFile || !user) {
        toast.error(ERROR_MESSAGES.REQUIRED_FIELDS);
        throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
      }

      const uniqueID = uniqid();
      const songFileNamePrefix = `song-${sanitizeTitle(title)}-${uniqueID}`;
      const imageFileNamePrefix = `image-${sanitizeTitle(title)}-${uniqueID}`;

      // Upload files to R2
      let songUrl: string | null;
      let imageUrl: string | null;

      try {
        songUrl = await uploadFile(songFile, "song", songFileNamePrefix);
        imageUrl = await uploadFile(imageFile, "image", imageFileNamePrefix);
      } catch (error) {
        toast.error(ERROR_MESSAGES.UPLOAD_FAILED);
        throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
      }

      if (!songUrl || !imageUrl) {
        toast.error(ERROR_MESSAGES.UPLOAD_FAILED);
        throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
      }

      // Create record
      const { error: supabaseError } = await supabaseClient
        .from("songs")
        .insert({
          user_id: user.id,
          title,
          author,
          lyrics,
          image_path: imageUrl,
          song_path: songUrl,
          genre: serializeGenres(genre),
          count: 0,
        });

      if (supabaseError) {
        toast.error(getErrorMessage(supabaseError));
        throw new Error(getErrorMessage(supabaseError));
      }

      return { title, author };
    },
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.songById] });
      queryClient.invalidateQueries({ queryKey: [CACHED_QUERIES.trendSongs] });

      // UIを更新
      router.refresh();
      toast.success("曲をアップロードしました");

      // モーダルを閉じる
      uploadModal.onClose();
    },
    onError: (error: Error) => {
      console.error("Upload song error:", error);
      toast.error(getErrorMessage(error, ERROR_MESSAGES.SONG_UPLOAD_FAILED));
    },
  });
};

export default useUploadSongMutation;
