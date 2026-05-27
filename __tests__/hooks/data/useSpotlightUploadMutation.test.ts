import useSpotlightUploadMutation from "@/hooks/data/useSpotlightUploadMutation";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils";
import { checkIsAdmin } from "@/actions/checkAdmin";
import { uploadFileToR2 } from "@/actions/r2";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/actions/checkAdmin");
jest.mock("@/actions/r2");

const mockUseUser = jest.fn(() => ({ user: { id: "user-1" } }));
jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => mockUseUser(),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("hooks/data/useSpotlightUploadMutation", () => {
  let mockSupabase: any;
  let mockInsert: jest.Mock;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    mockOnClose = jest.fn();
    mockInsert = jest.fn();
    mockSupabase = {
      from: jest.fn(() => ({
        insert: mockInsert,
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: true });
    (uploadFileToR2 as jest.Mock).mockResolvedValue({ success: true, url: "video-url" });
    mockUseUser.mockReturnValue({ user: { id: "user-1" } });
  });

  const setupHook = () =>
    renderHookWithQueryClient(() =>
      useSpotlightUploadMutation({ onClose: mockOnClose })
    );

  it("should fail if not admin", async () => {
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: false });

    const { result } = setupHook();
    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await expect(
      result.current.mutateAsync({
        title: "Title",
        author: "Author",
        genre: "Genre",
        description: "Desc",
        videoFile: file,
      })
    ).rejects.toThrow("管理者権限が必要です");

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("should upload spotlight if admin", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const { result } = setupHook();
    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await result.current.mutateAsync({
      title: "Title",
      author: "Author",
      genre: "Genre",
      description: "Desc",
      videoFile: file,
    });

    expect(uploadFileToR2).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith({
      video_path: "video-url",
      title: "Title",
      author: "Author",
      genre: "Genre",
      description: "Desc",
      user_id: "user-1",
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should fail if videoFile is null", async () => {
    const { result } = setupHook();
    await expect(
      result.current.mutateAsync({
        title: "Title",
        author: "Author",
        genre: "Genre",
        description: "Desc",
        videoFile: null,
      })
    ).rejects.toThrow("動画ファイルを選択してください");
    expect(toast.error).toHaveBeenCalledWith("動画ファイルを選択してください");
  });

  it("should fail if user is null", async () => {
    mockUseUser.mockReturnValue({ user: null });

    const { result } = setupHook();
    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await expect(
      result.current.mutateAsync({
        title: "Title",
        author: "Author",
        genre: "Genre",
        description: "Desc",
        videoFile: file,
      })
    ).rejects.toThrow("動画ファイルを選択してください");
    expect(toast.error).toHaveBeenCalledWith("動画ファイルを選択してください");
  });

  it("should fail if uploadFile throws (R2 error)", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue({ success: false, error: "R2 error" });

    const { result } = setupHook();
    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await expect(
      result.current.mutateAsync({
        title: "Title",
        author: "Author",
        genre: "Genre",
        description: "Desc",
        videoFile: file,
      })
    ).rejects.toThrow("動画のアップロードに失敗しました");
    expect(toast.error).toHaveBeenCalledWith("動画のアップロードに失敗しました");
  });

  it("should fail if uploadFile returns null URL", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue({ success: true, url: null });

    const { result } = setupHook();
    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await expect(
      result.current.mutateAsync({
        title: "Title",
        author: "Author",
        genre: "Genre",
        description: "Desc",
        videoFile: file,
      })
    ).rejects.toThrow("動画のアップロードに失敗しました");
    expect(toast.error).toHaveBeenCalledWith("動画のアップロードに失敗しました");
  });

  it("should fail if supabase insert returns error", async () => {
    mockInsert.mockResolvedValue({ error: { message: "Database error" } });

    const { result } = setupHook();
    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await expect(
      result.current.mutateAsync({
        title: "Title",
        author: "Author",
        genre: "Genre",
        description: "Desc",
        videoFile: file,
      })
    ).rejects.toThrow("Database error");
    expect(toast.error).toHaveBeenCalledWith("Database error");
  });
});
