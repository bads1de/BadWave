import { renderHook, act } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import useSpotlightUploadMutation from "@/hooks/data/useSpotlightUploadMutation";
import uploadFileToR2 from "@/actions/uploadFileToR2";
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

jest.mock("@/actions/uploadFileToR2", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("useSpotlightUploadMutation", () => {
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

  const mockSpotlightUploadModalHook = {
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (uploadFileToR2 as jest.Mock).mockResolvedValue(
      "https://example.com/video.mp4"
    );
  });

  it("動画のアップロードが成功した場合、正しく処理されること", async () => {
    const { result } = renderHook(
      () => useSpotlightUploadMutation(mockSpotlightUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    const videoFile = new File(["video content"], "video.mp4", {
      type: "video/mp4",
    });

    await act(async () => {
      await result.current.mutateAsync({
        title: "Test Video",
        author: "Test Author",
        genre: "Test Genre",
        description: "Test Description",
        videoFile,
      });
    });

    // ファイルアップロードが呼ばれたことを確認
    expect(uploadFileToR2).toHaveBeenCalledWith({
      file: videoFile,
      bucketName: "spotlight",
      fileType: "video",
      fileNamePrefix: "spotlight",
    });

    // Supabaseのinsertが呼ばれたことを確認
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("spotlights");
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
      video_path: "https://example.com/video.mp4",
      title: "Test Video",
      author: "Test Author",
      genre: "Test Genre",
      description: "Test Description",
      user_id: "test-user-id",
    });

    // 成功メッセージが表示されたことを確認
    expect(toast.success).toHaveBeenCalledWith("Spotlightに投稿しました!");

    // モーダルが閉じられたことを確認
    expect(mockSpotlightUploadModalHook.onClose).toHaveBeenCalled();

    // ルーターのリフレッシュが呼ばれたことを確認
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("必須フィールドが不足している場合、エラーが発生すること", async () => {
    const { result } = renderHook(
      () => useSpotlightUploadMutation(mockSpotlightUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Video",
          author: "Test Author",
          genre: "Test Genre",
          description: "Test Description",
          videoFile: null, // 必須フィールドが不足
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("動画ファイルを選択してください");

    // Supabaseのinsertが呼ばれていないことを確認
    expect(mockSupabaseClient.from().insert).not.toHaveBeenCalled();
  });

  it("ファイルアップロードに失敗した場合、エラーが発生すること", async () => {
    // ファイルアップロードの失敗をモック
    (uploadFileToR2 as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(
      () => useSpotlightUploadMutation(mockSpotlightUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Video",
          author: "Test Author",
          genre: "Test Genre",
          description: "Test Description",
          videoFile: new File(["video content"], "video.mp4", {
            type: "video/mp4",
          }),
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith(
      "動画のアップロードに失敗しました"
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
      () => useSpotlightUploadMutation(mockSpotlightUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Video",
          author: "Test Author",
          genre: "Test Genre",
          description: "Test Description",
          videoFile: new File(["video content"], "video.mp4", {
            type: "video/mp4",
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
