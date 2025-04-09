import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeletePlaylistSongsBtn from "@/components/Playlist/DeletePlaylistSongsBtn";
import useMutatePlaylistSong from "@/hooks/data/useMutatePlaylistSong";

// モックの設定
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
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

describe("DeletePlaylistSongsBtn", () => {
  const mockProps = {
    songId: "123",
    playlistId: "456",
    showText: true,
  };

  const mockDeleteMutation = {
    mutate: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutatePlaylistSong as jest.Mock).mockReturnValue({
      deletePlaylistSong: mockDeleteMutation,
    });
  });

  it("ボタンが正しく表示されること", () => {
    render(<DeletePlaylistSongsBtn {...mockProps} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("削除")).toBeInTheDocument();
  });

  it("ボタンクリック時にdeletePlaylistSong.mutateが呼ばれること", async () => {
    render(<DeletePlaylistSongsBtn {...mockProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockDeleteMutation.mutate).toHaveBeenCalledWith({
      songId: mockProps.songId,
      playlistId: mockProps.playlistId,
    });
  });

  it("ローディング中はボタンが無効化されること", () => {
    (useMutatePlaylistSong as jest.Mock).mockReturnValue({
      deletePlaylistSong: {
        ...mockDeleteMutation,
        isPending: true,
      },
    });

    render(<DeletePlaylistSongsBtn {...mockProps} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("showTextがfalseの場合、テキストが表示されないこと", () => {
    render(
      <DeletePlaylistSongsBtn songId="123" playlistId="456" showText={false} />
    );

    expect(screen.queryByText("削除")).not.toBeInTheDocument();
  });
});
