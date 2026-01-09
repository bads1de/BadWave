import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlaylistModal from "@/components/Modals/PlaylistModal";
import usePlaylistModal from "@/hooks/modal/usePlaylistModal";
import useCreatePlaylistMutation from "@/hooks/data/useCreatePlaylistMutation";

// Mock hooks
jest.mock("@/hooks/modal/usePlaylistModal");
jest.mock("@/hooks/data/useCreatePlaylistMutation");
jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" } }),
}));

// Mock child components
jest.mock("@/components/Modals/Modal", () => {
  return {
    __esModule: true,
    default: ({ isOpen, children }: any) => {
      if (!isOpen) return null;
      const React = require("react");
      return React.createElement("div", { "data-testid": "playlist-modal" }, children);
    },
  };
});

describe("components/Modals/PlaylistModal", () => {
  const mockMutateAsync = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlaylistModal as unknown as jest.Mock).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
    });
    (useCreatePlaylistMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("renders when open", () => {
    render(<PlaylistModal />);
    expect(screen.getByTestId("playlist-modal")).toBeInTheDocument();
  });

  it("submits form with title", async () => {
    render(<PlaylistModal />);
    
    const input = screen.getByPlaceholderText("プレイリスト名");
    fireEvent.change(input, { target: { value: "My Playlist" } });

    const submitBtn = screen.getByRole("button", { name: "作成" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ title: "My Playlist" });
    });
  });

  it("does not submit empty title", async () => {
    render(<PlaylistModal />);
    
    const submitBtn = screen.getByRole("button", { name: "作成" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
});