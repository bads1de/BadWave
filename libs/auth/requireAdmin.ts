import toast from "react-hot-toast";
import { checkIsAdmin } from "@/actions/checkAdmin";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

/**
 * 管理者権限を確認し、権限がない場合はエラーをスローするクライアントサイドヘルパー
 *
 * useUploadSongMutation, useDeleteSongMutation, useSpotlightUploadMutation,
 * usePulseUploadMutation で重複していた管理者チェックパターンを共通化。
 *
 * @throws {Error} 管理者でない場合
 */
export async function requireAdminPermission(): Promise<void> {
  const { isAdmin } = await checkIsAdmin();

  if (!isAdmin) {
    toast.error(ERROR_MESSAGES.ADMIN_REQUIRED);
    throw new Error(ERROR_MESSAGES.ADMIN_REQUIRED);
  }
}
