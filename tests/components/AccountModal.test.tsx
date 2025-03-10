import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import AccountModal from "@/app/account/components/AccountModal";
import uploadFileToR2 from "@/actions/uploadFileToR2";
import deleteFileFromR2 from "@/actions/deleteFileFromR2";

// モックの設定
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  dismiss: jest.fn(),
}));

jest.mock("@/actions/uploadFileToR2", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/actions/deleteFileFromR2", () => ({
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

  beforeEach(() => {
    jest.clearAllMocks();

    // Supabaseクライアントのモック
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { app_metadata: { provider: "email" } } } },
        }),
        updateUser: jest.fn().mockResolvedValue({ error: null }),
      },
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("モーダルが正しく表示されること", () => {
    render(<AccountModal {...mockProps} />);

    expect(screen.getByText("プロフィール編集")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ユーザー名")).toHaveValue("Test User");
  });

  it("プロフィール名の更新が正しく動作すること", async () => {
    render(<AccountModal {...mockProps} />);

    const input = screen.getByPlaceholderText("ユーザー名");
    fireEvent.change(input, { target: { value: "New Name" } });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("プロフィールを更新しました");
    });
  });

  it("アバター画像の更新が正しく動作すること", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue(
      "https://example.com/new-avatar.jpg"
    );

    render(<AccountModal {...mockProps} />);

    const fileInput = screen.getByLabelText("画像を変更");
    const file = new File(["dummy content"], "avatar.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(deleteFileFromR2).toHaveBeenCalled();
      expect(uploadFileToR2).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("アバターを更新しました");
    });
  });

  it("パスワード更新が正しく動作すること", async () => {
    render(<AccountModal {...mockProps} />);

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
      expect(toast.success).toHaveBeenCalledWith("パスワードを更新しました");
    });
  });

  it("パスワードが一致しない場合にエラーを表示すること", async () => {
    render(<AccountModal {...mockProps} />);

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
    render(<AccountModal {...mockProps} />);

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
