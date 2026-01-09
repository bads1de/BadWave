import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditModal from "@/components/Modals/EditModal";
import useEditSongMutation from "@/hooks/data/useEditSongMutation";
import { Song } from "@/types";

// Mock AWS SDK to avoid runtime issues
jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  S3Client: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

jest.mock("@/hooks/data/useEditSongMutation");
jest.mock("@/components/Modals/Modal", () => {
  return {
    __esModule: true,
    default: ({ isOpen, children }: any) => {
      if (!isOpen) return null;
      const React = require("react");
      return React.createElement("div", { "data-testid": "edit-modal" }, children);
    },
  };
});

// Mock simple components
jest.mock("@/components/Genre/GenreSelect", () => {
  return {
    __esModule: true,
    default: ({ onGenreChange }: any) => {
      const React = require("react");
      return React.createElement("button", { 
        onClick: () => onGenreChange("Rock"),
        "data-testid": "genre-select" 
      }, "Select Genre");
    },
  };
});

describe("components/Modals/EditModal", () => {
  const mockSong: Song = {
    id: "song-1",
    user_id: "user-1",
    title: "Old Title",
    author: "Old Author",
    lyrics: "Old Lyrics",
    genre: "Pop",
    image_path: "img.jpg",
    song_path: "audio.mp3",
  } as any;

  const mockMutateAsync = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useEditSongMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    // URL.createObjectURL mock is needed for file preview logic if we test file selection
    global.URL.createObjectURL = jest.fn(() => "blob:test");
  });

  it("renders with initial values", () => {
    render(<EditModal song={mockSong} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByPlaceholderText("曲のタイトル")).toHaveValue("Old Title");
    expect(screen.getByPlaceholderText("曲の作者")).toHaveValue("Old Author");
    expect(screen.getByPlaceholderText("歌詞")).toHaveValue("Old Lyrics");
  });

  it("submits updated values", async () => {
    render(<EditModal song={mockSong} isOpen={true} onClose={mockOnClose} />);

    const titleInput = screen.getByPlaceholderText("曲のタイトル");
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    // Select new genre
    fireEvent.click(screen.getByTestId("genre-select"));

    const submitBtn = screen.getByRole("button", { name: "編集" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        id: "song-1",
        title: "New Title",
        genre: ["Rock"],
        currentSong: mockSong,
      }));
    });
  });
});