import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import EditModal from "@/components/Modals/EditModal";
import useEditSongMutation from "@/hooks/data/useEditSongMutation";
import { Song } from "@/types";

// モックの設定
jest.mock("@/hooks/data/useEditSongMutation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// URL.createObjectURLのモック
global.URL.createObjectURL = jest.fn(() => "mock-url");

describe("EditModal", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // テスト用のサンプル曲データ
  const mockSong: Song = {
    id: "test-song-id",
    user_id: "test-user-id",
    title: "Test Song",
    author: "Test Artist",
    lyrics: "Test Lyrics",
    image_path: "https://example.com/image.jpg",
    song_path: "https://example.com/song.mp3",
    video_path: "https://example.com/video.mp4",
    genre: "Rock, Pop",
    created_at: new Date().toISOString(),
    count: 0,
  };

  const mockMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useEditSongMutation as jest.Mock).mockReturnValue(mockMutation);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EditModal song={mockSong} isOpen={true} onClose={mockOnClose} />
      </QueryClientProvider>
    );
  };

  it("モーダルが正しく表示されること", () => {
    renderComponent();

    expect(screen.getByText("曲を編集")).toBeInTheDocument();
    expect(screen.getByText("曲の情報を編集します。")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Song")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Artist")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Lyrics")).toBeInTheDocument();
    expect(screen.getByText("編集")).toBeInTheDocument();
  });

  it("フォーム送信が正しく動作すること", async () => {
    renderComponent();

    // フォーム入力を変更
    fireEvent.change(screen.getByDisplayValue("Test Song"), {
      target: { value: "Updated Song" },
    });
    fireEvent.change(screen.getByDisplayValue("Test Artist"), {
      target: { value: "Updated Artist" },
    });
    fireEvent.change(screen.getByDisplayValue("Test Lyrics"), {
      target: { value: "Updated Lyrics" },
    });

    // フォーム送信
    fireEvent.submit(screen.getByRole("form"));

    // ミューテーションが呼ばれたことを確認
    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        id: mockSong.id,
        title: "Updated Song",
        author: "Updated Artist",
        lyrics: "Updated Lyrics",
        genre: expect.any(Array),
        videoFile: null,
        songFile: null,
        imageFile: null,
        currentSong: mockSong,
      });
    });
  });

  it("ファイルアップロードが正しく動作すること", async () => {
    renderComponent();

    // 音声ファイルのアップロード
    const songFileInput = screen.getByLabelText("曲を選択（50MB以下）");
    const songFile = new File(["audio content"], "song.mp3", {
      type: "audio/mpeg",
    });
    fireEvent.change(songFileInput, { target: { files: [songFile] } });

    // 画像ファイルのアップロード
    const imageFileInput = screen.getByLabelText("画像を選択（5MB以下）");
    const imageFile = new File(["image content"], "image.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(imageFileInput, { target: { files: [imageFile] } });

    // ビデオファイルのアップロード
    const videoFileInput = screen.getByLabelText("ビデオを選択（5MB以下）");
    const videoFile = new File(["video content"], "video.mp4", {
      type: "video/mp4",
    });
    fireEvent.change(videoFileInput, { target: { files: [videoFile] } });

    // フォーム送信
    fireEvent.submit(screen.getByRole("form"));

    // ミューテーションが呼ばれたことを確認
    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        id: mockSong.id,
        title: "Test Song",
        author: "Test Artist",
        lyrics: "Test Lyrics",
        genre: expect.any(Array),
        videoFile: videoFile,
        songFile: songFile,
        imageFile: imageFile,
        currentSong: mockSong,
      });
    });
  });

  it("ローディング中は送信ボタンが無効化されること", () => {
    // ローディング状態をモック
    (useEditSongMutation as jest.Mock).mockReturnValue({
      ...mockMutation,
      isPending: true,
    });

    renderComponent();

    const submitButton = screen.getByRole("button", {
      name: "編集中...",
    });
    expect(submitButton).toBeDisabled();
  });

  it("モーダルが閉じられるとフォームがリセットされること", () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <EditModal song={mockSong} isOpen={true} onClose={mockOnClose} />
      </QueryClientProvider>
    );

    // フォーム入力を変更
    fireEvent.change(screen.getByDisplayValue("Test Song"), {
      target: { value: "Updated Song" },
    });

    // モーダルを閉じる
    rerender(
      <QueryClientProvider client={queryClient}>
        <EditModal song={mockSong} isOpen={false} onClose={mockOnClose} />
      </QueryClientProvider>
    );

    // モーダルを再度開く
    rerender(
      <QueryClientProvider client={queryClient}>
        <EditModal song={mockSong} isOpen={true} onClose={mockOnClose} />
      </QueryClientProvider>
    );

    // フォームがリセットされていることを確認
    expect(screen.getByDisplayValue("Test Song")).toBeInTheDocument();
  });

  it("エラー発生時にコンソールにエラーが記録されること", async () => {
    // コンソールエラーをモック
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // ミューテーションがエラーをスローするようにモック
    mockMutation.mutateAsync.mockRejectedValue(new Error("Test error"));

    renderComponent();

    // フォーム送信
    fireEvent.submit(screen.getByRole("form"));

    // エラーがコンソールに記録されることを確認
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Edit error:",
        expect.any(Error)
      );
    });

    // コンソールエラーを元に戻す
    console.error = originalConsoleError;
  });
});
