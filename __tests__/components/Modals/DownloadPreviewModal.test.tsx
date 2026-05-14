import { render, screen, fireEvent } from "@testing-library/react";
import DownloadPreviewModal from "@/components/Modals/DownloadPreviewModal";

// Dialog UI のモック - JSXを使わない
jest.mock("@/components/ui/dialog", () => ({
  Dialog: "div",
  DialogContent: "div",
  DialogHeader: "div",
  DialogTitle: "div",
  DialogTrigger: "div",
}));

describe("components/Modals/DownloadPreviewModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Song",
    audioUrl: "/songs/test.mp3",
    videoUrl: "/videos/test.mp4",
    handleDownloadClick: jest.fn(),
  };

  it("モーダルが開いているとき、タイトルが表示される", () => {
    render(<DownloadPreviewModal {...defaultProps} />);
    expect(screen.getByText("Test Song")).toBeInTheDocument();
  });

  it("ダウンロードボタンが表示される", () => {
    render(<DownloadPreviewModal {...defaultProps} />);
    expect(screen.getByText(/EXTRACT_MP4/i)).toBeInTheDocument();
    expect(screen.getByText(/EXTRACT_MP3/i)).toBeInTheDocument();
  });

  it("handleDownloadClickがvideoタイプで呼ばれる", () => {
    const handleDownloadClick = jest.fn();
    render(<DownloadPreviewModal {...defaultProps} handleDownloadClick={handleDownloadClick} />);
    fireEvent.click(screen.getByText(/EXTRACT_MP4/i));
    expect(handleDownloadClick).toHaveBeenCalledWith("video");
  });

  it("handleDownloadClickがaudioタイプで呼ばれる", () => {
    const handleDownloadClick = jest.fn();
    render(<DownloadPreviewModal {...defaultProps} handleDownloadClick={handleDownloadClick} />);
    fireEvent.click(screen.getByText(/EXTRACT_MP3/i));
    expect(handleDownloadClick).toHaveBeenCalledWith("audio");
  });
});
