import { uploadFile } from "@/libs/storage/upload";
import { uploadFileToR2 } from "@/actions/r2";

// Mock r2 action
jest.mock("@/actions/r2", () => ({
  uploadFileToR2: jest.fn(),
}));

describe("libs/upload", () => {
  const mockFile = new File(["test content"], "test.mp3", {
    type: "audio/mpeg",
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("アップロードに成功した場合にURLを返す", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://example.com/uploads/test.mp3",
    });

    const result = await uploadFile(mockFile, "song", "test-song");

    expect(result).toBe("https://example.com/uploads/test.mp3");
    expect(uploadFileToR2).toHaveBeenCalledTimes(1);

    // FormDataの内容を確認
    const formData = (uploadFileToR2 as jest.Mock).mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(mockFile);
    expect(formData.get("bucketName")).toBe("song");
    expect(formData.get("fileNamePrefix")).toBe("test-song");
  });

  it("アップロードが失敗した場合にエラーをスローする", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: false,
      error: "Bucket not found",
    });

    await expect(uploadFile(mockFile, "song", "test-song")).rejects.toThrow(
      "Bucket not found"
    );
  });

  it("アップロード失敗時にエラーメッセージがない場合はデフォルトメッセージをスローする", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: false,
      error: null,
    });

    await expect(uploadFile(mockFile, "song", "test-song")).rejects.toThrow(
      "アップロードに失敗しました"
    );
  });

  it("result.urlがnullの場合にnullを返す", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: true,
      url: null,
    });

    const result = await uploadFile(mockFile, "song", "test-song");
    expect(result).toBeNull();
  });

  it("異なるバケット名とプレフィックスでアップロードできる", async () => {
    (uploadFileToR2 as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://example.com/spotlight/test.mp4",
    });

    const result = await uploadFile(mockFile, "spotlight", "video-intro");

    expect(result).toBe("https://example.com/spotlight/test.mp4");
    const formData = (uploadFileToR2 as jest.Mock).mock.calls[0][0];
    expect(formData.get("bucketName")).toBe("spotlight");
    expect(formData.get("fileNamePrefix")).toBe("video-intro");
  });
});
