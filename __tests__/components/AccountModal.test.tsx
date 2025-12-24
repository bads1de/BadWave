import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/libs/supabase/client";
import { toast } from "react-hot-toast";
import AccountModal from "@/app/account/components/AccountModal";
import useUpdateUserProfileMutation from "@/hooks/data/useUpdateUserProfileMutation";

// モックの設定
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
  default: {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
}));

jest.mock("@/hooks/data/useUpdateUserProfileMutation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("AccountModal", () => {
  const mockUser = {
    id: "test-user-id",
    full_name: "Test User",
    avatar_url: "https://example.com/avatar.jpg",
  };

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    user: mockUser,
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // モックミューテーション
  const mockUpdateProfile = {
    mutate: jest.fn(),
    isPending: false,
  };

  const mockUpdateAvatar = {
    mutate: jest.fn(),
    isPending: false,
  };

  const mockUpdatePassword = {
    mutate: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Supabaseクライアントのモック
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { app_metadata: { provider: "email" } } } },
        }),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // useUpdateUserProfileMutationのモック
    (useUpdateUserProfileMutation as jest.Mock).mockReturnValue({
      updateProfile: mockUpdateProfile,
      updateAvatar: mockUpdateAvatar,
      updatePassword: mockUpdatePassword,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AccountModal {...mockProps} />
      </QueryClientProvider>
    );
  };

  it("モーダルが正しく表示されること", () => {
    renderComponent();

    expect(screen.getByText("プロフィール編集")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ユーザー名を入力")).toHaveValue(
      "Test User"
    );
  });

  it("プロフィール名の更新が正しく動作すること", async () => {
    renderComponent();

    const input = screen.getByPlaceholderText("ユーザー名を入力");
    fireEvent.change(input, { target: { value: "New Name" } });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpdateProfile.mutate).toHaveBeenCalledWith({
        userId: "test-user-id",
        fullName: "New Name",
      });
    });
  });

  it("アバター画像の更新が正しく動作すること", async () => {
    renderComponent();

    const fileInput = screen.getByLabelText("画像を変更");
    const file = new File(["dummy content"], "avatar.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpdateAvatar.mutate).toHaveBeenCalledWith(
        {
          userId: "test-user-id",
          avatarFile: file,
          currentAvatarUrl: "https://example.com/avatar.jpg",
        },
        expect.any(Object)
      );
    });
  });

  it("パスワード更新が正しく動作すること", async () => {
    renderComponent();

    // パスワード入力フィールドが表示されるまで待機
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("新しいパスワード")
      ).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByPlaceholderText("新しいパスワード");
    const confirmPasswordInput =
      screen.getByPlaceholderText("パスワードの確認");

    fireEvent.change(newPasswordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "newPassword123" },
    });

    const form = screen.getByTestId("password-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpdatePassword.mutate).toHaveBeenCalledWith(
        {
          newPassword: "newPassword123",
        },
        expect.any(Object)
      );
    });
  });

  it("パスワードが一致しない場合にエラーを表示すること", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("新しいパスワード")
      ).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByPlaceholderText("新しいパスワード");
    const confirmPasswordInput =
      screen.getByPlaceholderText("パスワードの確認");

    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "different123" },
    });

    const form = screen.getByTestId("password-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("パスワードが一致しません");
    });
  });

  it("パスワードが8文字未満の場合にエラーを表示すること", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("新しいパスワード")
      ).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByPlaceholderText("新しいパスワード");
    const confirmPasswordInput =
      screen.getByPlaceholderText("パスワードの確認");

    fireEvent.change(newPasswordInput, { target: { value: "short" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "short" } });

    const form = screen.getByTestId("password-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "パスワードは8文字以上で入力してください"
      );
    });
  });
});
