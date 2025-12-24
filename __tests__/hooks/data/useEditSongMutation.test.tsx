import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useEditSongMutation from "@/hooks/data/useEditSongMutation";
import uploadFileToR2 from "@/actions/uploadFileToR2";
import deleteFileFromR2 from "@/actions/deleteFileFromR2";
import { createClient } from "@/libs/supabase/client";
import { Song } from "@/types";

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

jest.mock("@/actions/uploadFileToR2", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/actions/deleteFileFromR2", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("useEditSongMutation", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

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
  };

  const mockEditModalHook = {
    onClose: jest.fn(),
  };

  // テスト用のサンプル曲データ
  const mockSong: Song = {
    id: "test-song-id",
    user_id: "test-user-id",
    title: "Original Title",
    author: "Original Author",
    lyrics: "Original Lyrics",
    image_path: "https://example.com/original-image.jpg",
    song_path: "https://example.com/original-song.mp3",
    video_path: "https://example.com/original-video.mp4",
    genre: "Rock",
    created_at: new Date().toISOString(),
    count: "0",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (uploadFileToR2 as jest.Mock).mockImplementation(async ({ fileType }) => {
      if (fileType === "audio") return "https://example.com/updated-song.mp3";
      if (fileType === "image") return "https://example.com/updated-image.jpg";
      if (fileType === "video") return "https://example.com/updated-video.mp4";
      return null;
    });
  });

  it("曲の編集が成功した場合、正しく処理されること", async () => {
    const { result } = renderHook(
      () => useEditSongMutation(mockEditModalHook),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync({
        id: mockSong.id,
        title: "Updated Title",
        author: "Updated Author",
        lyrics: "Updated Lyrics",
        genre: ["Pop"],
        currentSong: mockSong,
      });
    });

    // Supabaseのupdateが呼ばれたことを確認
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("songs");
    expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
      title: "Updated Title",
      author: "Updated Author",
      lyrics: "Updated Lyrics",
      genre: "Pop",
      video_path: mockSong.video_path,
      song_path: mockSong.song_path,
      image_path: mockSong.image_path,
    });
    expect(mockSupabaseClient.from().update().eq).toHaveBeenCalledWith(
      "id",
      mockSong.id
    );

    // 成功メッセージが表示されたことを確認
    expect(toast.success).toHaveBeenCalledWith("曲を編集しました");

    // モーダルが閉じられたことを確認
    expect(mockEditModalHook.onClose).toHaveBeenCalled();

    // ルーターのリフレッシュが呼ばれたことを確認
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("ファイルアップロードを含む編集が成功した場合、正しく処理されること", async () => {
    const { result } = renderHook(
      () => useEditSongMutation(mockEditModalHook),
      { wrapper }
    );

    const songFile = new File(["song content"], "song.mp3", {
      type: "audio/mpeg",
    });
    const imageFile = new File(["image content"], "image.jpg", {
      type: "image/jpeg",
    });
    const videoFile = new File(["video content"], "video.mp4", {
      type: "video/mp4",
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: mockSong.id,
        title: "Updated Title",
        author: "Updated Author",
        lyrics: "Updated Lyrics",
        genre: ["Pop"],
        songFile,
        imageFile,
        videoFile,
        currentSong: mockSong,
      });
    });

    // ファイルアップロードが呼ばれたことを確認
    expect(uploadFileToR2).toHaveBeenCalledTimes(3);

    // 古いファイルの削除が呼ばれたことを確認
    expect(deleteFileFromR2).toHaveBeenCalledTimes(3);

    // Supabaseのupdateが呼ばれたことを確認
    expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
      title: "Updated Title",
      author: "Updated Author",
      lyrics: "Updated Lyrics",
      genre: "Pop",
      video_path: "https://example.com/updated-video.mp4",
      song_path: "https://example.com/updated-song.mp3",
      image_path: "https://example.com/updated-image.jpg",
    });
  });

  it("IDが不足している場合、エラーが発生すること", async () => {
    const { result } = renderHook(
      () => useEditSongMutation(mockEditModalHook),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          id: "", // 空のID
          title: "Updated Title",
          author: "Updated Author",
          lyrics: "Updated Lyrics",
          genre: ["Pop"],
          currentSong: mockSong,
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("曲のIDが必要です");

    // Supabaseのupdateが呼ばれていないことを確認
    expect(mockSupabaseClient.from().update).not.toHaveBeenCalled();
  });

  it("ファイルアップロードに失敗した場合でも、他のフィールドは更新されること", async () => {
    // ファイルアップロードの失敗をモック
    (uploadFileToR2 as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(
      () => useEditSongMutation(mockEditModalHook),
      { wrapper }
    );

    const songFile = new File(["song content"], "song.mp3", {
      type: "audio/mpeg",
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: mockSong.id,
        title: "Updated Title",
        author: "Updated Author",
        lyrics: "Updated Lyrics",
        genre: ["Pop"],
        songFile,
        currentSong: mockSong,
      });
    });

    // ファイルアップロードが失敗してもエラーメッセージが表示されること
    expect(toast.error).toHaveBeenCalledWith("曲のアップロードに失敗しました");

    // 元のパスが使用されることを確認
    expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
      title: "Updated Title",
      author: "Updated Author",
      lyrics: "Updated Lyrics",
      genre: "Pop",
      video_path: mockSong.video_path,
      song_path: mockSong.song_path,
      image_path: mockSong.image_path,
    });
  });

  it("Supabaseのupdateに失敗した場合、エラーが発生すること", async () => {
    // Supabaseのupdate失敗をモック
    mockSupabaseClient.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          error: { message: "Database error" },
        }),
      }),
    });

    const { result } = renderHook(
      () => useEditSongMutation(mockEditModalHook),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({
          id: mockSong.id,
          title: "Updated Title",
          author: "Updated Author",
          lyrics: "Updated Lyrics",
          genre: ["Pop"],
          currentSong: mockSong,
        });
      } catch (error) {
        // エラーが発生することを期待
      }
    });

    // エラーメッセージが表示されたことを確認
    expect(toast.error).toHaveBeenCalledWith("編集に失敗しました");
  });
});
