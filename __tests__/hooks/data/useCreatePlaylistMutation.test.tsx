import { renderHook, act } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import useCreatePlaylistMutation from "@/hooks/data/useCreatePlaylistMutation";
import { createClient } from "@/libs/supabase/client";

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

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("useCreatePlaylistMutation", () => {
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

  const mockUser = {
    id: "test-user-id",
    full_name: "Test User",
  };

  const mockSupabaseClient = {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        error: null,
      }),
    }),
  };

  const mockPlaylistModalHook = {
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUser as jest.Mock).mockReturnValue({ userDetails: mockUser });
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it("プレイリストの作成が成功した場合、正しく処理されること", async () => {
    const { result } = renderHook(() =>
      useCreatePlaylistMutation(mockPlaylistModalHook)
    );

    await act(async () => {
      await result.current.mutateAsync({
        title: "Test Playlist",
      });
    });

    // Supabaseのinsertが呼ばれたことを確認
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("playlists");
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
      user_id: "test-user-id",
      user_name: "Test User",
      title: "Test Playlist",
      is_public: false,
    });

    // 成功メッセージが表示されたことを確認
    expect(toast.success).toHaveBeenCalledWith("プレイリストを作成しました");

    // モーダルが閉じられたことを確認
    expect(mockPlaylistModalHook.onClose).toHaveBeenCalled();

    // ルーターのリフレッシュが呼ばれたことを確認
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("タイトルが空の場合、エラーが発生すること", async () => {
    const { result } = renderHook(() =>
      useCreatePlaylistMutation(mockPlaylistModalHook)
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "", // 空のタイトル
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("タイトルを入力してください");

    // Supabaseのinsertが呼ばれていないことを確認
    expect(mockSupabaseClient.from().insert).not.toHaveBeenCalled();
  });

  it("ユーザーが存在しない場合、エラーが発生すること", async () => {
    // ユーザーが存在しない状態をモック
    (useUser as jest.Mock).mockReturnValue({ userDetails: null });

    const { result } = renderHook(() =>
      useCreatePlaylistMutation(mockPlaylistModalHook)
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Playlist",
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("タイトルを入力してください");

    // Supabaseのinsertが呼ばれていないことを確認
    expect(mockSupabaseClient.from().insert).not.toHaveBeenCalled();
  });

  it("Supabaseのinsertに失敗した場合、エラーが発生すること", async () => {
    // Supabaseのinsert失敗をモック
    mockSupabaseClient.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        error: { message: "Database error" },
      }),
    });

    const { result } = renderHook(() =>
      useCreatePlaylistMutation(mockPlaylistModalHook)
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Playlist",
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("Database error");
  });
});
