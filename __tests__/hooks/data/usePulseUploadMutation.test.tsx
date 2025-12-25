import { renderHook, act } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import usePulseUploadMutation from "@/hooks/data/usePulseUploadMutation";
import { uploadFileToR2 } from "@/actions/r2";
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

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/actions/r2", () => ({
  __esModule: true,
  uploadFileToR2: jest.fn(),
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("usePulseUploadMutation", () => {
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
  };

  const mockSupabaseClient = {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        error: null,
      }),
    }),
  };

  const mockPulseUploadModalHook = {
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://example.com/audio.mp3",
    });
  });

  it("音声のアップロードが成功した場合、正しく処理されること", async () => {
    const { result } = renderHook(
      () => usePulseUploadMutation(mockPulseUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    const musicFile = new File(["audio content"], "audio.mp3", {
      type: "audio/mpeg",
    });

    await act(async () => {
      await result.current.mutateAsync({
        title: "Test Pulse",
        genre: "Synthwave",
        musicFile,
      });
    });

    // ファイルアップロードが呼ばれたことを確認（FormDataとして）
    expect(uploadFileToR2).toHaveBeenCalled();

    // Supabaseのinsertが呼ばれたことを確認
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("pulses");
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
      music_path: "https://example.com/audio.mp3",
      title: "Test Pulse",
      genre: "Synthwave",
      user_id: "test-user-id",
    });

    // 成功メッセージが表示されたことを確認
    expect(toast.success).toHaveBeenCalledWith("Pulseを投稿しました!");

    // モーダルが閉じられたことを確認
    expect(mockPulseUploadModalHook.onClose).toHaveBeenCalled();

    // ルーターのリフレッシュが呼ばれたことを確認
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("音声ファイルが不足している場合、エラーが発生すること", async () => {
    const { result } = renderHook(
      () => usePulseUploadMutation(mockPulseUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Pulse",
          genre: "Synthwave",
          musicFile: null, // 必須フィールドが不足
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("音声ファイルを選択してください");

    // Supabaseのinsertが呼ばれていないことを確認
    expect(mockSupabaseClient.from().insert).not.toHaveBeenCalled();
  });

  it("タイトルが空の場合、エラーが発生すること", async () => {
    const { result } = renderHook(
      () => usePulseUploadMutation(mockPulseUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    const musicFile = new File(["audio content"], "audio.mp3", {
      type: "audio/mpeg",
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "  ", // 空のタイトル
          genre: "Synthwave",
          musicFile,
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

  it("ジャンルが空の場合、エラーが発生すること", async () => {
    const { result } = renderHook(
      () => usePulseUploadMutation(mockPulseUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    const musicFile = new File(["audio content"], "audio.mp3", {
      type: "audio/mpeg",
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Pulse",
          genre: "  ", // 空のジャンル
          musicFile,
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("ジャンルを入力してください");

    // Supabaseのinsertが呼ばれていないことを確認
    expect(mockSupabaseClient.from().insert).not.toHaveBeenCalled();
  });

  it("ファイルアップロードに失敗した場合、エラーが発生すること", async () => {
    // ファイルアップロードの失敗をモック
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: false,
      error: "アップロードに失敗しました",
    });

    const { result } = renderHook(
      () => usePulseUploadMutation(mockPulseUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Pulse",
          genre: "Synthwave",
          musicFile: new File(["audio content"], "audio.mp3", {
            type: "audio/mpeg",
          }),
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith(
      "音声のアップロードに失敗しました"
    );

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

    const { result } = renderHook(
      () => usePulseUploadMutation(mockPulseUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Pulse",
          genre: "Synthwave",
          musicFile: new File(["audio content"], "audio.mp3", {
            type: "audio/mpeg",
          }),
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("Database error");
  });
});
