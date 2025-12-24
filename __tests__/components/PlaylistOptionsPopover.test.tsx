import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PlaylistOptionsPopover from "@/components/Playlist/PlaylistOptionsPopover";

// モックの設定
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(() => ({
    user: { id: "test-user-id" },
  })),
}));

describe("PlaylistOptionsPopover", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockProps = {
    playlistId: "test-playlist-id",
    currentTitle: "テストプレイリスト",
    isPublic: false,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();

    // Supabaseクライアントのモック
    // Supabaseクライアントのモック
    const mockPostgrestBuilder = {
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve({ error: null })),
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue(mockPostgrestBuilder),
        delete: jest.fn().mockReturnValue(mockPostgrestBuilder),
        select: jest.fn().mockReturnValue(mockPostgrestBuilder),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("ポップオーバーが正しく表示されること", () => {
    render(<PlaylistOptionsPopover {...mockProps} />, { wrapper });

    // 三点リーダーボタンをクリック
    const optionsButton = screen.getByLabelText("More Options");
    fireEvent.click(optionsButton);

    // メニュー項目の確認
    expect(screen.getByText("名前を変更")).toBeInTheDocument();
    expect(screen.getByText("削除")).toBeInTheDocument();
  });

  it("プレイリスト名の更新が正しく動作すること", async () => {
    render(<PlaylistOptionsPopover {...mockProps} />, { wrapper });

    // 編集モードを開始
    const optionsButton = screen.getByLabelText("More Options");
    fireEvent.click(optionsButton);
    const editButton = screen.getByText("名前を変更");
    fireEvent.click(editButton);

    // 新しい名前を入力
    const input = screen.getByPlaceholderText("プレイリスト名");
    fireEvent.change(input, { target: { value: "新しいプレイリスト名" } });

    // 保存ボタンをクリック
    const saveButton = screen.getByText("保存");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "プレイリスト名を更新しました"
      );
    });
  });

  it("プレイリストの削除が正しく動作すること", async () => {
    render(<PlaylistOptionsPopover {...mockProps} />, { wrapper });

    // 削除ボタンをクリック
    const optionsButton = screen.getByLabelText("More Options");
    fireEvent.click(optionsButton);
    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("プレイリストを削除しました");
    });
  });

  it("編集をキャンセルできること", () => {
    render(<PlaylistOptionsPopover {...mockProps} />, { wrapper });

    // 編集モードを開始
    const optionsButton = screen.getByLabelText("More Options");
    fireEvent.click(optionsButton);
    const editButton = screen.getByText("名前を変更");
    fireEvent.click(editButton);

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    // 編集モードが終了していることを確認
    expect(
      screen.queryByPlaceholderText("プレイリスト名")
    ).not.toBeInTheDocument();
  });

  it("エラー時に適切なメッセージを表示すること", async () => {
    // Supabaseエラーをモック
    const mockError = new Error("Database error");
    const mockPostgrestBuilder = {
      eq: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve({ error: mockError })),
    };

    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue(mockPostgrestBuilder),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    render(<PlaylistOptionsPopover {...mockProps} />, { wrapper });

    // 編集モードを開始して保存
    const optionsButton = screen.getByLabelText("More Options");
    fireEvent.click(optionsButton);
    const editButton = screen.getByText("名前を変更");
    fireEvent.click(editButton);
    const saveButton = screen.getByText("保存");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "プレイリスト名の更新に失敗しました"
      );
    });
  });
});
