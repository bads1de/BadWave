import { renderHook, act } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useUpdateUserProfileMutation from "@/hooks/data/useUpdateUserProfileMutation";
import { uploadFileToR2 } from "@/actions/r2";
import { deleteFileFromR2 } from "@/actions/r2";
import { createClient } from "@/libs/supabase/client";
import { createWrapper } from "../../test-utils";

// モックの設定
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/actions/r2", () => ({
  __esModule: true,
  uploadFileToR2: jest.fn(),
  deleteFileFromR2: jest.fn(),
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("useUpdateUserProfileMutation", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // テストのためにモックを使用する
  const mockRouter = {
    refresh: jest.fn(),
  };

  const mockSupabaseClient = {
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          error: null,
        }),
      }),
    }),
    auth: {
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
  };

  const mockAccountModalHook = {
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://example.com/avatar.jpg",
    });
    (deleteFileFromR2 as jest.Mock).mockResolvedValue({ success: true });
  });

  describe("updateProfile", () => {
    it("プロフィール更新が成功した場合、正しく処理されること", async () => {
      const { result } = renderHook(
        () => useUpdateUserProfileMutation(mockAccountModalHook),
        {
          wrapper: createWrapper(),
        }
      );

      await act(async () => {
        await result.current.updateProfile.mutateAsync({
          userId: "test-user-id",
          fullName: "Updated Name",
        });
      });

      // Supabaseのupdateが呼ばれたことを確認
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("users");
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
        full_name: "Updated Name",
      });
      expect(mockSupabaseClient.from().update().eq).toHaveBeenCalledWith(
        "id",
        "test-user-id"
      );

      // 成功メッセージが表示されたことを確認
      expect(toast.success).toHaveBeenCalledWith("プロフィールを更新しました");

      // モーダルが閉じられたことを確認
      expect(mockAccountModalHook.onClose).toHaveBeenCalled();

      // ルーターのリフレッシュが呼ばれたことを確認
      expect(mockRouter.refresh).toHaveBeenCalled();
    });

    it("ユーザーIDが不足している場合、エラーが発生すること", async () => {
      const { result } = renderHook(
        () => useUpdateUserProfileMutation(mockAccountModalHook),
        {
          wrapper: createWrapper(),
        }
      );

      await act(async () => {
        try {
          await result.current.updateProfile.mutateAsync({
            userId: "", // 空のID
            fullName: "Updated Name",
          });
        } catch (error) {
          // エラーが発生することを期待
        }
      });

      // エラーメッセージが表示されたことを確認
      expect(toast.error).toHaveBeenCalledWith("ユーザーIDが必要です");

      // Supabaseのupdateが呼ばれていないことを確認
      expect(mockSupabaseClient.from().update).not.toHaveBeenCalled();
    });
  });

  describe("updateAvatar", () => {
    it("アバター更新が成功した場合、正しく処理されること", async () => {
      const { result } = renderHook(
        () => useUpdateUserProfileMutation(mockAccountModalHook),
        {
          wrapper: createWrapper(),
        }
      );

      const avatarFile = new File(["avatar content"], "avatar.jpg", {
        type: "image/jpeg",
      });

      await act(async () => {
        await result.current.updateAvatar.mutateAsync({
          userId: "test-user-id",
          avatarFile,
          currentAvatarUrl: "https://example.com/old-avatar.jpg",
        });
      });

      // 古いアバターの削除が呼ばれたことを確認
      expect(deleteFileFromR2).toHaveBeenCalledWith("image", "old-avatar.jpg");

      // 新しいアバターのアップロードが呼ばれたことを確認（FormDataとして）
      expect(uploadFileToR2).toHaveBeenCalled();

      // Supabaseのupdateが呼ばれたことを確認
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("users");
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
        avatar_url: "https://example.com/avatar.jpg",
      });

      // 成功メッセージが表示されたことを確認
      expect(toast.success).toHaveBeenCalledWith("アバターを更新しました");
    });

    it("ファイルアップロードに失敗した場合、エラーが発生すること", async () => {
      // ファイルアップロードの失敗をモック
      (uploadFileToR2 as jest.Mock).mockResolvedValue({
        success: false,
        error: "アップロードに失敗しました",
      });

      const { result } = renderHook(
        () => useUpdateUserProfileMutation(mockAccountModalHook),
        {
          wrapper: createWrapper(),
        }
      );

      const avatarFile = new File(["avatar content"], "avatar.jpg", {
        type: "image/jpeg",
      });

      await act(async () => {
        try {
          await result.current.updateAvatar.mutateAsync({
            userId: "test-user-id",
            avatarFile,
          });
        } catch (error) {
          // エラーが発生することを期待
        }
      });

      // エラーメッセージが表示されたことを確認
      expect(toast.error).toHaveBeenCalled();

      // Supabaseのupdateが呼ばれていないことを確認
      expect(mockSupabaseClient.from().update).not.toHaveBeenCalled();
    });
  });

  describe("updatePassword", () => {
    it("パスワード更新が成功した場合、正しく処理されること", async () => {
      const { result } = renderHook(
        () => useUpdateUserProfileMutation(mockAccountModalHook),
        {
          wrapper: createWrapper(),
        }
      );

      await act(async () => {
        await result.current.updatePassword.mutateAsync({
          newPassword: "newPassword123",
        });
      });

      // Supabaseの認証APIが呼ばれたことを確認
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: "newPassword123",
      });

      // 成功メッセージが表示されたことを確認
      expect(toast.success).toHaveBeenCalledWith("パスワードを更新しました");

      // モーダルが閉じられたことを確認
      expect(mockAccountModalHook.onClose).toHaveBeenCalled();
    });

    it("パスワードが短すぎる場合、エラーが発生すること", async () => {
      const { result } = renderHook(
        () => useUpdateUserProfileMutation(mockAccountModalHook),
        {
          wrapper: createWrapper(),
        }
      );

      await act(async () => {
        try {
          await result.current.updatePassword.mutateAsync({
            newPassword: "short", // 8文字未満
          });
        } catch (error) {
          // エラーが発生することを期待
        }
      });

      // エラーメッセージが表示されたことを確認
      expect(toast.error).toHaveBeenCalledWith(
        "パスワードは8文字以上で入力してください"
      );

      // Supabaseの認証APIが呼ばれていないことを確認
      expect(mockSupabaseClient.auth.updateUser).not.toHaveBeenCalled();
    });
  });
});
