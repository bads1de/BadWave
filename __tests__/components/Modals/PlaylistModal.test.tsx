import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlaylistModal from "@/components/Modals/PlaylistModal";
import usePlaylistModal from "@/hooks/modal/usePlaylistModal";
import { useUser } from "@/hooks/auth/useUser";
import useCreatePlaylistMutation from "@/hooks/data/useCreatePlaylistMutation";

// モックの設定
jest.mock("@/hooks/modal/usePlaylistModal", () => ({
  __esModule: true,
  default: () => mockPlaylistModal,
}));

const mockPlaylistModal = {
  isOpen: true,
  onOpen: jest.fn(),
  onClose: jest.fn(),
};

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/hooks/data/useCreatePlaylistMutation", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("PlaylistModal", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockUser = {
    id: "test-user-id",
    full_name: "Test User",
  };

  const mockMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({ userDetails: mockUser });
    (useCreatePlaylistMutation as jest.Mock).mockReturnValue(mockMutation);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PlaylistModal />
      </QueryClientProvider>
    );
  };

  it("モーダルが正しく表示されること", () => {
    renderComponent();

    expect(screen.getByText("プレイリストを作成")).toBeInTheDocument();
    expect(
      screen.getByText("プレイリストのタイトルを入力してください")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("プレイリスト名")).toBeInTheDocument();
    expect(screen.getByText("作成")).toBeInTheDocument();
  });

  it("フォーム送信が正しく動作すること", async () => {
    renderComponent();

    // フォーム入力
    fireEvent.change(screen.getByPlaceholderText("プレイリスト名"), {
      target: { value: "Test Playlist" },
    });

    // フォーム送信
    fireEvent.submit(screen.getByRole("form"));

    // ミューテーションが呼ばれたことを確認
    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        title: "Test Playlist",
      });
    });
  });

  it("ローディング中は送信ボタンが無効化されること", () => {
    // ローディング状態をモック
    (useCreatePlaylistMutation as jest.Mock).mockReturnValue({
      ...mockMutation,
      isPending: true,
    });

    renderComponent();

    const submitButton = screen.getByRole("button", {
      name: "作成中",
    });
    expect(submitButton).toBeDisabled();
  });

  it("モーダルが閉じられるとフォームがリセットされること", () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <PlaylistModal />
      </QueryClientProvider>
    );

    // フォーム入力
    fireEvent.change(screen.getByPlaceholderText("プレイリスト名"), {
      target: { value: "Test Playlist" },
    });

    // モーダルを閉じる
    mockPlaylistModal.isOpen = false;
    rerender(
      <QueryClientProvider client={queryClient}>
        <PlaylistModal />
      </QueryClientProvider>
    );

    // モーダルを再度開く
    mockPlaylistModal.isOpen = true;
    rerender(
      <QueryClientProvider client={queryClient}>
        <PlaylistModal />
      </QueryClientProvider>
    );

    // フォームがリセットされていることを確認
    expect(screen.getByPlaceholderText("プレイリスト名")).toHaveValue("");
  });
});
