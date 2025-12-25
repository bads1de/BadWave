import { renderHook, act } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import useUploadSongMutation from "@/hooks/data/useUploadSongMutation";
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

jest.mock("uniqid", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue("mock-unique-id"),
}));

jest.mock("@/actions/checkAdmin", () => ({
  checkIsAdmin: jest.fn().mockResolvedValue({ isAdmin: true }),
}));

describe("useUploadSongMutation", () => {
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

  const mockUploadModalHook = {
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (uploadFileToR2 as jest.Mock).mockImplementation(
      async (formData: FormData) => {
        const bucketName = formData.get("bucketName");
        return {
          success: true,
          url:
            bucketName === "song"
              ? "https://example.com/song.mp3"
              : "https://example.com/image.jpg",
        };
      }
    );
  });

  it("曲のアップロードが成功した場合、正しく処理されること", async () => {
    const { result } = renderHook(
      () => useUploadSongMutation(mockUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    const songFile = new File(["song content"], "song.mp3", {
      type: "audio/mpeg",
    });
    const imageFile = new File(["image content"], "image.jpg", {
      type: "image/jpeg",
    });

    await act(async () => {
      await result.current.mutateAsync({
        title: "Test Song",
        author: "Test Artist",
        lyrics: "Test Lyrics",
        genre: ["Rock"],
        songFile,
        imageFile,
      });
    });

    // ファイルアップロードが呼ばれたことを確認
    expect(uploadFileToR2).toHaveBeenCalledTimes(2);

    // Supabaseのinsertが呼ばれたことを確認
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("songs");
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
      user_id: "test-user-id",
      title: "Test Song",
      author: "Test Artist",
      lyrics: "Test Lyrics",
      image_path: "https://example.com/image.jpg",
      song_path: "https://example.com/song.mp3",
      genre: "Rock",
      count: 0,
    });

    // 成功メッセージが表示されたことを確認
    expect(toast.success).toHaveBeenCalledWith("曲をアップロードしました");

    // モーダルが閉じられたことを確認
    expect(mockUploadModalHook.onClose).toHaveBeenCalled();

    // ルーターのリフレッシュが呼ばれたことを確認
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("必須フィールドが不足している場合、エラーが発生すること", async () => {
    const { result } = renderHook(
      () => useUploadSongMutation(mockUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Song",
          author: "Test Artist",
          lyrics: "Test Lyrics",
          genre: ["Rock"],
          songFile: null, // 必須フィールドが不足
          imageFile: new File(["image content"], "image.jpg", {
            type: "image/jpeg",
          }),
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("必須フィールドが未入力です");

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
      () => useUploadSongMutation(mockUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Song",
          author: "Test Artist",
          lyrics: "Test Lyrics",
          genre: ["Rock"],
          songFile: new File(["song content"], "song.mp3", {
            type: "audio/mpeg",
          }),
          imageFile: new File(["image content"], "image.jpg", {
            type: "image/jpeg",
          }),
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalled();

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
      () => useUploadSongMutation(mockUploadModalHook),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          title: "Test Song",
          author: "Test Artist",
          lyrics: "Test Lyrics",
          genre: ["Rock"],
          songFile: new File(["song content"], "song.mp3", {
            type: "audio/mpeg",
          }),
          imageFile: new File(["image content"], "image.jpg", {
            type: "image/jpeg",
          }),
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("Database error");

    // モーダルが閉じられていないことを確認
    expect(mockUploadModalHook.onClose).not.toHaveBeenCalled();
  });
});
