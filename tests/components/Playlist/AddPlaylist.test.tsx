import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import AddPlaylist from "@/components/Playlist/AddPlaylist";
import useMutatePlaylistSong from "@/hooks/data/useMutatePlaylistSong";
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/auth/useAuthModal";
import { createClient } from "@/libs/supabase/client";
import usePlaylistSongStatus from "@/hooks/data/usePlaylistSongStatus";

// モックの設定
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("@/hooks/data/useMutatePlaylistSong", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/hooks/data/usePlaylistSongStatus", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/hooks/auth/useAuthModal", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  })),
}));

jest.mock("@/hooks/data/useGetSongById", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    song: { id: "123", title: "Test Song" },
  })),
}));

describe("AddPlaylist", () => {
  const mockPlaylists = [
    {
      id: "1",
      title: "Playlist 1",
      user_id: "user1",
      is_public: true,
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "2",
      title: "Playlist 2",
      user_id: "user1",
      is_public: false,
      created_at: "2023-01-02T00:00:00Z",
    },
  ];

  const mockProps = {
    playlists: mockPlaylists,
    songId: "123",
    songType: "regular" as const,
  };

  const mockAddMutation = {
    mutate: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutatePlaylistSong as jest.Mock).mockReturnValue({
      addPlaylistSong: mockAddMutation,
    });
    (usePlaylistSongStatus as jest.Mock).mockReturnValue({
      isInPlaylist: { "1": false, "2": false },
      isLoading: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user1" },
    });
  });

  it("ドロップダウンメニューが正しく表示されること", async () => {
    render(<AddPlaylist {...mockProps} />);

    // トリガーボタンをクリック
    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    // プレイリスト項目が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("Playlist 1")).toBeInTheDocument();
      expect(screen.getByText("Playlist 2")).toBeInTheDocument();
    });
  });

  it("プレイリスト項目クリック時にaddPlaylistSong.mutateが呼ばれること", async () => {
    render(<AddPlaylist {...mockProps} />);

    // トリガーボタンをクリック
    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    // プレイリスト項目をクリック
    await waitFor(() => {
      const playlistItem = screen.getByText("Playlist 1");
      fireEvent.click(playlistItem);
    });

    expect(mockAddMutation.mutate).toHaveBeenCalledWith({
      songId: mockProps.songId,
      playlistId: "1",
    });
  });

  it("ユーザーが未認証の場合、authModal.onOpenが呼ばれること", async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<AddPlaylist {...mockProps} />);

    // トリガーボタンをクリック
    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    // プレイリスト項目をクリック
    await waitFor(() => {
      const playlistItem = screen.getByText("Playlist 1");
      fireEvent.click(playlistItem);
    });

    expect(useAuthModal().onOpen).toHaveBeenCalled();
    expect(mockAddMutation.mutate).not.toHaveBeenCalled();
  });

  it("曲がすでにプレイリストに追加されている場合、エラーメッセージが表示されること", async () => {
    (usePlaylistSongStatus as jest.Mock).mockReturnValue({
      isInPlaylist: { "1": true, "2": false },
      isLoading: false,
    });

    render(<AddPlaylist {...mockProps} />);

    // トリガーボタンをクリック
    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    // プレイリスト項目をクリック
    await waitFor(() => {
      const playlistItem = screen.getByText("Playlist 1");
      fireEvent.click(playlistItem);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "既にプレイリストに追加されています。"
    );
    expect(mockAddMutation.mutate).not.toHaveBeenCalled();
  });

  it("プレイリストが空の場合、適切なメッセージが表示されること", async () => {
    render(<AddPlaylist {...mockProps} playlists={[]} />);

    // トリガーボタンをクリック
    const triggerButton = screen.getByRole("button");
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(
        screen.getByText("プレイリストを作成しましょう！")
      ).toBeInTheDocument();
    });
  });
});
