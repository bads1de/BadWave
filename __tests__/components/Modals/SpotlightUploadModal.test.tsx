import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpotlightUploadModal from "@/components/Modals/SpotlightUploadModal";
import useSpotLightUploadModal from "@/hooks/modal/useSpotLightUpload";
import { useUser } from "@/hooks/auth/useUser";
import useSpotlightUploadMutation from "@/hooks/data/useSpotlightUploadMutation";

// モックの設定
jest.mock("@/hooks/modal/useSpotLightUpload", () => ({
  __esModule: true,
  default: () => mockSpotlightUploadModal,
}));

const mockSpotlightUploadModal = {
  isOpen: true,
  onOpen: jest.fn(),
  onClose: jest.fn(),
};

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/hooks/data/useSpotlightUploadMutation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe("SpotlightUploadModal", () => {
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
    (useSpotlightUploadMutation as jest.Mock).mockReturnValue(mockMutation);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SpotlightUploadModal />
      </QueryClientProvider>
    );
  };

  it("モーダルが正しく表示されること", () => {
    renderComponent();

    expect(screen.getByText("Spotlightに動画を投稿")).toBeInTheDocument();
    expect(
      screen.getByText("動画をアップロードしてSpotlightで共有しましょう！")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("動画のタイトル")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("投稿者名")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ジャンルを記載")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("動画の説明")).toBeInTheDocument();
    expect(screen.getByText("動画ファイル")).toBeInTheDocument();
    expect(screen.getByText("投稿する")).toBeInTheDocument();
  });

  it("フォーム送信が正しく動作すること", async () => {
    renderComponent();

    // フォーム入力
    fireEvent.change(screen.getByPlaceholderText("動画のタイトル"), {
      target: { value: "Test Video" },
    });
    fireEvent.change(screen.getByPlaceholderText("投稿者名"), {
      target: { value: "Test Author" },
    });
    fireEvent.change(screen.getByPlaceholderText("ジャンルを記載"), {
      target: { value: "Test Genre" },
    });
    fireEvent.change(screen.getByPlaceholderText("動画の説明"), {
      target: { value: "Test Description" },
    });

    // ファイルアップロード
    const fileInput = screen.getByLabelText("動画ファイル");
    const videoFile = new File(["video content"], "video.mp4", {
      type: "video/mp4",
    });
    fireEvent.change(fileInput, { target: { files: [videoFile] } });

    // フォーム送信
    fireEvent.submit(screen.getByRole("form"));

    // ミューテーションが呼ばれたことを確認
    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        title: "Test Video",
        author: "Test Author",
        genre: "Test Genre",
        description: "Test Description",
        videoFile: expect.any(File),
      });
    });
  });

  it("ローディング中は送信ボタンが無効化されること", () => {
    // ローディング状態をモック
    (useSpotlightUploadMutation as jest.Mock).mockReturnValue({
      ...mockMutation,
      isPending: true,
    });

    renderComponent();

    const submitButton = screen.getByRole("button", {
      name: "投稿する",
    });
    expect(submitButton).toBeDisabled();
  });

  it("モーダルが閉じられるとフォームがリセットされること", () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <SpotlightUploadModal />
      </QueryClientProvider>
    );

    // フォーム入力
    fireEvent.change(screen.getByPlaceholderText("動画のタイトル"), {
      target: { value: "Test Video" },
    });

    // モーダルを閉じる
    mockSpotlightUploadModal.isOpen = false;
    rerender(
      <QueryClientProvider client={queryClient}>
        <SpotlightUploadModal />
      </QueryClientProvider>
    );

    // モーダルを再度開く
    mockSpotlightUploadModal.isOpen = true;
    rerender(
      <QueryClientProvider client={queryClient}>
        <SpotlightUploadModal />
      </QueryClientProvider>
    );

    // フォームがリセットされていることを確認
    expect(screen.getByPlaceholderText("動画のタイトル")).toHaveValue("");
  });
});
