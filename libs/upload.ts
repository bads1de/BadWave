import { uploadFileToR2 } from "@/actions/r2";
import type { BucketName } from "@/actions/r2";

/**
 * ファイルをFormDataに変換してR2にアップロードする共通ヘルパー
 *
 * useUploadSongMutation, useEditSongMutation, useSpotlightUploadMutation,
 * useUpdateUserProfileMutation, usePulseUploadMutation で重複していた
 * uploadFile 関数を共通化。
 *
 * @param file - アップロードするファイル
 * @param bucketName - R2のバケット名
 * @param fileNamePrefix - ファイル名のプレフィックス
 * @returns アップロードされたファイルのURL
 */
export async function uploadFile(
  file: File,
  bucketName: BucketName,
  fileNamePrefix: string,
): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucketName", bucketName);
  formData.append("fileNamePrefix", fileNamePrefix);

  const result = await uploadFileToR2(formData);

  if (!result.success) {
    throw new Error(result.error || "アップロードに失敗しました");
  }

  return result.url || null;
}
