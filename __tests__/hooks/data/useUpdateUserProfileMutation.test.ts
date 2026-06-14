import useUpdateUserProfileMutation from "@/hooks/data/useUpdateUserProfileMutation";
import { createClient } from "@/libs/supabase/client";
import { uploadFileToR2, deleteFileFromR2 } from "@/actions/r2";
import { renderHookWithQueryClient } from "../../test-utils";

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/actions/r2");

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

import toast from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock AWS SDK to prevent import errors via r2 action
jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  S3Client: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

describe("hooks/data/useUpdateUserProfileMutation", () => {
  let mockSupabase: any;
  let mockUpdate: jest.Mock;
  let mockUpdateUser: jest.Mock;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose = jest.fn();

    mockUpdate = jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }));
    mockUpdateUser = jest.fn().mockResolvedValue({ error: null });

    mockSupabase = {
      from: jest.fn(() => ({
        update: mockUpdate,
      })),
      auth: {
        updateUser: mockUpdateUser,
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: true,
      url: "new-avatar-url",
    });
    (deleteFileFromR2 as jest.Mock).mockResolvedValue({ success: true });
  });

  describe("updateProfile", () => {
    it("updates profile name successfully", async () => {
      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await result.current.updateProfile.mutateAsync({
        userId: "user-1",
        fullName: "New Name",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockUpdate).toHaveBeenCalledWith({ full_name: "New Name" });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("throws error when userId is empty", async () => {
      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await expect(
        result.current.updateProfile.mutateAsync({
          userId: "",
          fullName: "New Name",
        })
      ).rejects.toThrow("ユーザーIDが必要です");

      expect(toast.error).toHaveBeenCalledWith("ユーザーIDが必要です");
    });

    it("throws error when supabase update fails", async () => {
      mockUpdate.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error("DB error") }),
      });

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await expect(
        result.current.updateProfile.mutateAsync({
          userId: "user-1",
          fullName: "New Name",
        })
      ).rejects.toThrow();

      expect(toast.error).toHaveBeenCalledWith("DB error");
    });
  });

  describe("updateAvatar", () => {
    it("updates avatar successfully with currentAvatarUrl", async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockUpdate.mockReturnValue({ eq: mockEq });

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      const file = new File([""], "avatar.png", { type: "image/png" });
      await result.current.updateAvatar.mutateAsync({
        userId: "user-1",
        avatarFile: file,
        currentAvatarUrl: "old-avatar.png",
      });

      expect(deleteFileFromR2).toHaveBeenCalledWith("image", "old-avatar.png");
      expect(uploadFileToR2).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({ avatar_url: "new-avatar-url" });
    });

    it("updates avatar without currentAvatarUrl (skips delete)", async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockUpdate.mockReturnValue({ eq: mockEq });

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      const file = new File([""], "avatar.png", { type: "image/png" });
      await result.current.updateAvatar.mutateAsync({
        userId: "user-1",
        avatarFile: file,
      });

      expect(deleteFileFromR2).not.toHaveBeenCalled();
      expect(uploadFileToR2).toHaveBeenCalled();
    });

    it("continues when deleting old avatar fails", async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      mockUpdate.mockReturnValue({ eq: mockEq });
      (deleteFileFromR2 as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      const file = new File([""], "avatar.png", { type: "image/png" });
      // Should not throw - deletion failure is non-fatal
      await expect(
        result.current.updateAvatar.mutateAsync({
          userId: "user-1",
          avatarFile: file,
          currentAvatarUrl: "old-avatar.png",
        })
      ).resolves.toBeDefined();
    });

    it("throws error when userId or avatarFile is missing", async () => {
      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await expect(
        result.current.updateAvatar.mutateAsync({
          userId: "",
          avatarFile: null as unknown as File,
        })
      ).rejects.toThrow("ユーザーIDと画像が必要です");

      expect(toast.error).toHaveBeenCalledWith("ユーザーIDと画像が必要です");
    });

    it("throws error when upload fails (catch)", async () => {
      (uploadFileToR2 as jest.Mock).mockRejectedValue(new Error("Upload error"));

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      const file = new File([""], "avatar.png", { type: "image/png" });
      await expect(
        result.current.updateAvatar.mutateAsync({
          userId: "user-1",
          avatarFile: file,
        })
      ).rejects.toThrow("ファイルのアップロードに失敗しました");

      expect(toast.error).toHaveBeenCalledWith("ファイルのアップロードに失敗しました");
    });

    it("throws error when upload returns null URL", async () => {
      (uploadFileToR2 as jest.Mock).mockResolvedValue({
        success: true,
        url: null,
      });

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      const file = new File([""], "avatar.png", { type: "image/png" });
      await expect(
        result.current.updateAvatar.mutateAsync({
          userId: "user-1",
          avatarFile: file,
        })
      ).rejects.toThrow("ファイルのアップロードに失敗しました");

      expect(toast.error).toHaveBeenCalledWith("ファイルのアップロードに失敗しました");
    });

    it("throws error when supabase avatar update fails", async () => {
      const mockEq = jest.fn().mockResolvedValue({
        error: new Error("DB avatar error"),
      });
      mockUpdate.mockReturnValue({ eq: mockEq });

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      const file = new File([""], "avatar.png", { type: "image/png" });
      await expect(
        result.current.updateAvatar.mutateAsync({
          userId: "user-1",
          avatarFile: file,
        })
      ).rejects.toThrow();

      expect(toast.error).toHaveBeenCalledWith("DB avatar error");
    });
  });

  describe("updatePassword", () => {
    it("updates password successfully", async () => {
      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await result.current.updatePassword.mutateAsync({
        newPassword: "new-password-123",
      });

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: "new-password-123",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("throws error when password is too short", async () => {
      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await expect(
        result.current.updatePassword.mutateAsync({
          newPassword: "short",
        })
      ).rejects.toThrow("パスワードは8文字以上で入力してください");

      expect(toast.error).toHaveBeenCalledWith(
        "パスワードは8文字以上で入力してください"
      );
    });

    it("throws error when password is empty", async () => {
      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await expect(
        result.current.updatePassword.mutateAsync({
          newPassword: "",
        })
      ).rejects.toThrow("パスワードは8文字以上で入力してください");
    });

    it("throws error when supabase auth update fails", async () => {
      mockUpdateUser.mockResolvedValue({
        error: new Error("Auth error"),
      });

      const { result } = renderHookWithQueryClient(() =>
        useUpdateUserProfileMutation({ onClose: mockOnClose })
      );

      await expect(
        result.current.updatePassword.mutateAsync({
          newPassword: "new-password-123",
        })
      ).rejects.toThrow();

      expect(toast.error).toHaveBeenCalledWith("Auth error");
    });
  });
});
