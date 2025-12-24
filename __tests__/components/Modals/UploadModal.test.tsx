import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import UploadModal from "@/components/Modals/UploadModal";
import useUploadModal from "@/hooks/modal/useUploadModal";
import { useUser } from "@/hooks/auth/useUser";
import useUploadSongMutation from "@/hooks/data/useUploadSongMutation";

// モックの設定
jest.mock("@/hooks/modal/useUploadModal", () => ({
  __esModule: true,
  default: () => mockUploadModal,
}));

const mockUploadModal = {
  isOpen: true,
  onOpen: jest.fn(),
  onClose: jest.fn(),
};

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/hooks/data/useUploadSongMutation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

describe("UploadModal", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockUser = {
    id: "test-user-id",
  };

  const mockMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (useUploadSongMutation as jest.Mock).mockReturnValue(mockMutation);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UploadModal />
      </QueryClientProvider>
    );
  };

  it("モーダルが正しく表示されること", () => {
    renderComponent();

    expect(screen.getByText("曲をアップロード")).toBeInTheDocument();
    expect(
      screen.getByText("mp3ファイルと画像ファイルを選択してください")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("曲のタイトル")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("アーティスト名")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("歌詞")).toBeInTheDocument();
    expect(screen.getByText("ジャンル")).toBeInTheDocument();
    expect(screen.getByText("ファイルを選択")).toBeInTheDocument();
    expect(screen.getByText("アップロード")).toBeInTheDocument();
  });

  it("フォーム入力が正しく動作すること", () => {
    renderComponent();

    // タイトル入力
    const titleInput = screen.getByPlaceholderText("曲のタイトル");
    fireEvent.change(titleInput, { target: { value: "Test Song" } });
    expect(titleInput).toHaveValue("Test Song");

    // アーティスト名入力
    const authorInput = screen.getByPlaceholderText("アーティスト名");
    fireEvent.change(authorInput, { target: { value: "Test Artist" } });
    expect(authorInput).toHaveValue("Test Artist");

    // 歌詞入力
    const lyricsInput = screen.getByPlaceholderText("歌詞");
    fireEvent.change(lyricsInput, { target: { value: "Test Lyrics" } });
    expect(lyricsInput).toHaveValue("Test Lyrics");
  });

  it("ファイルアップロードが正しく動作すること", () => {
    renderComponent();

    const fileInput = screen.getByLabelText("ファイルを選択");

    // 音声ファイルのアップロード
    const audioFile = new File(["audio content"], "song.mp3", {
      type: "audio/mpeg",
    });

    // 画像ファイルのアップロード
    const imageFile = new File(["image content"], "image.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, { target: { files: [audioFile, imageFile] } });

    // プレビューが表示されることを確認
    waitFor(() => {
      expect(
        screen.getByAltText("アップロードされた画像のプレビュー")
      ).toBeInTheDocument();
      expect(screen.getByRole("audio")).toBeInTheDocument();
    });
  });

  it("フォーム送信が正しく動作すること", async () => {
    renderComponent();

    // フォーム入力
    fireEvent.change(screen.getByPlaceholderText("曲のタイトル"), {
      target: { value: "Test Song" },
    });
    fireEvent.change(screen.getByPlaceholderText("アーティスト名"), {
      target: { value: "Test Artist" },
    });
    fireEvent.change(screen.getByPlaceholderText("歌詞"), {
      target: { value: "Test Lyrics" },
    });

    // ファイルアップロード
    const fileInput = screen.getByLabelText("ファイルを選択");
    const audioFile = new File(["audio content"], "song.mp3", {
      type: "audio/mpeg",
    });
    const imageFile = new File(["image content"], "image.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(fileInput, { target: { files: [audioFile, imageFile] } });

    // フォーム送信
    fireEvent.submit(screen.getByRole("form"));

    // ミューテーションが呼ばれたことを確認
    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        title: "Test Song",
        author: "Test Artist",
        lyrics: "Test Lyrics",
        genre: expect.any(Array),
        songFile: expect.any(File),
        imageFile: expect.any(File),
      });
    });
  });

  it("ローディング中は送信ボタンが無効化されること", () => {
    // ローディング状態をモック
    (useUploadSongMutation as jest.Mock).mockReturnValue({
      ...mockMutation,
      isPending: true,
    });

    renderComponent();

    const submitButton = screen.getByRole("button", {
      name: "アップロード中...",
    });
    expect(submitButton).toBeDisabled();
  });

  it("必須フィールドが未入力の場合、エラーが表示されること", async () => {
    renderComponent();

    // タイトルとアーティスト名のみ入力（ファイルは未入力）
    fireEvent.change(screen.getByPlaceholderText("曲のタイトル"), {
      target: { value: "Test Song" },
    });
    fireEvent.change(screen.getByPlaceholderText("アーティスト名"), {
      target: { value: "Test Artist" },
    });

    // フォーム送信
    fireEvent.submit(screen.getByRole("form"));

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("必須フィールドが未入力です");
    });
  });
});
