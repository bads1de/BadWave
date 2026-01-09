import { waitFor } from "@testing-library/react";
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

jest.mock("react-hot-toast", () => ({
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
    mockOnClose = jest.fn();
    mockUpdate = jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) }));
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
    
    (uploadFileToR2 as jest.Mock).mockResolvedValue({ success: true, url: "new-avatar-url" });
    (deleteFileFromR2 as jest.Mock).mockResolvedValue({ success: true });
  });

  it("updates profile name", async () => {
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

  it("updates avatar", async () => {
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

  it("updates password", async () => {
    const { result } = renderHookWithQueryClient(() => 
      useUpdateUserProfileMutation({ onClose: mockOnClose })
    );

    await result.current.updatePassword.mutateAsync({
      newPassword: "new-password-123",
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: "new-password-123" });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
