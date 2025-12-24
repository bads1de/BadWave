import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpotlightUploadModal from "@/components/Modals/SpotlightUploadModal";
import useSpotLightUploadModal from "@/hooks/modal/useSpotLightUpload";
import { useUser } from "@/hooks/auth/useUser";
import useSpotlightUploadMutation from "@/hooks/data/useSpotlightUploadMutation";

// モックの設定
const mockOnClose = jest.fn();
let mockIsOpen = true;

jest.mock("@/hooks/modal/useSpotLightUpload", () => ({
  __esModule: true,
  default: () => ({
    isOpen: mockIsOpen,
    onOpen: jest.fn(),
    onClose: mockOnClose,
  }),
}));

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
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsOpen = true;

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
    const fileInput = screen.getByLabelText(/動画ファイル/i);
    const videoFile = new File(["video content"], "video.mp4", {
      type: "video/mp4",
    });
    fireEvent.change(fileInput, { target: { files: [videoFile] } });

    // フォーム送信
    const form = screen.getByRole("form", { name: /Spotlight投稿/i });
    fireEvent.submit(form);

    // ミューテーションが呼ばれたことを確認 (Timeoutを長めに設定)
    await waitFor(
      () => {
        expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
          title: "Test Video",
          author: "Test Author",
          genre: "Test Genre",
          description: "Test Description",
          videoFile: expect.any(File),
        });
      },
      { timeout: 5000 }
    );
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

  it("モーダルが閉じられるとフォームがリセットされること", async () => {
    const { rerender } = renderComponent();

    // フォーム入力
    const titleInput = screen.getByPlaceholderText("動画のタイトル");
    fireEvent.change(titleInput, {
      target: { value: "Test Video" },
    });
    expect(titleInput).toHaveValue("Test Video");

    // モーダルを閉じる
    mockIsOpen = false;
    rerender(
      <QueryClientProvider client={queryClient}>
        <SpotlightUploadModal />
      </QueryClientProvider>
    );

    // モーダルを再度開く
    mockIsOpen = true;
    rerender(
      <QueryClientProvider client={queryClient}>
        <SpotlightUploadModal />
      </QueryClientProvider>
    );

    // フォームがリセットされていることを確認
    await waitFor(() => {
      expect(screen.getByPlaceholderText("動画のタイトル")).toHaveValue("");
    });
  });
});
