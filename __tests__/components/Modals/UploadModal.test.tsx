import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadModal from "@/components/Modals/UploadModal";
import useUploadModal from "@/hooks/modal/useUploadModal";
import useUploadSongMutation from "@/hooks/data/useUploadSongMutation";
import { useUser } from "@/hooks/auth/useUser";
import { toast } from "react-hot-toast";

// Mock AWS SDK to avoid runtime issues in Jest
jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  S3Client: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

// Mock hooks
jest.mock("@/hooks/modal/useUploadModal");
jest.mock("@/hooks/data/useUploadSongMutation");
jest.mock("@/hooks/auth/useUser");
jest.mock("react-hot-toast");

// Mock child components
jest.mock("@/components/Modals/Modal", () => {
  return {
    __esModule: true,
    default: ({ isOpen, children }: any) => {
      if (!isOpen) return null;
      const React = require("react");
      return React.createElement("div", { "data-testid": "upload-modal" }, children);
    },
  };
});

jest.mock("@/components/Genre/GenreSelect", () => {
  return {
    __esModule: true,
    default: ({ onGenreChange }: any) => {
      const React = require("react");
      return React.createElement("button", {
        onClick: () => onGenreChange("Pop"),
        "data-testid": "genre-select"
      }, "Select Genre");
    },
  };
});

describe("components/Modals/UploadModal", () => {
  const mockMutateAsync = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUploadModal as unknown as jest.Mock).mockReturnValue({
      isOpen: true,
      onClose: mockOnClose,
    });
    (useUploadSongMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1" },
    });
  });

  it("renders upload form when open", () => {
    render(<UploadModal />);
    expect(screen.getByTestId("upload-modal")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("曲のタイトル")).toBeInTheDocument();
  });

  it("validates required fields on submit", async () => {
    render(<UploadModal />);
    
    const submitBtn = screen.getByRole("button", { name: "アップロード" });
    fireEvent.click(submitBtn);

    // Form validation prevents submission, so mutation should not be called
    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it("submits form with valid data", async () => {
    // We need to setup a more complex mock for URL.createObjectURL since it's used in the component
    global.URL.createObjectURL = jest.fn(() => "blob:test");

    render(<UploadModal />);

    // Fill text inputs
    fireEvent.change(screen.getByPlaceholderText("曲のタイトル"), { target: { value: "My Song" } });
    fireEvent.change(screen.getByPlaceholderText("アーティスト名"), { target: { value: "Me" } });
    
    // Select genre (mock component)
    fireEvent.click(screen.getByTestId("genre-select"));

    // File inputs
    // getByLabelText returns the input element because of htmlFor/id association
    const fileInput = screen.getByLabelText("ファイルを選択"); 
    const songFile = new File(["song"], "song.mp3", { type: "audio/mpeg" });
    const imageFile = new File(["image"], "image.jpg", { type: "image/jpeg" });

    // Simulate selecting both files
    fireEvent.change(fileInput, { target: { files: [songFile, imageFile] } });

    // Submit
    const submitBtn = screen.getByRole("button", { name: "アップロード" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        title: "My Song",
        author: "Me",
        genre: ["Pop"],
        songFile: expect.any(File),
        imageFile: expect.any(File),
      }));
    });
  });
});