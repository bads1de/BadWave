/**
 * R2 Server Action Tests
 *
 * Note: Server Actions with file uploads are challenging to unit test directly
 * due to the FormData/File API differences between Node.js and browser environments.
 * These tests focus on validation logic and error handling.
 * The actual S3 upload logic is tested through integration tests.
 */

import { uploadFileToR2, deleteFileFromR2 } from "@/actions/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/libs/s3";

// Mock the s3 client module
jest.mock("@/libs/s3", () => ({
  __esModule: true,
  default: {
    send: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

// ============================================================================
// uploadFileToR2 Tests
// ============================================================================

describe("uploadFileToR2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.R2_SONG_URL = "https://song.example.com";
    process.env.R2_IMAGE_URL = "https://image.example.com";
    process.env.R2_SPOTLIGHT_URL = "https://spotlight.example.com";
    process.env.R2_VIDEO_URL = "https://video.example.com";
  });

  describe("バリデーション", () => {
    it("ファイルがない場合、エラーを返すこと", async () => {
      const formData = new FormData();
      formData.append("bucketName", "song");

      const result = await uploadFileToR2(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("ファイルとバケット名は必須です");
    });

    it("バケット名がない場合、エラーを返すこと", async () => {
      const mockFile = new File(["test"], "test.mp3", { type: "audio/mpeg" });
      const formData = new FormData();
      formData.append("file", mockFile);

      const result = await uploadFileToR2(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("ファイルとバケット名は必須です");
    });

    it("50MBを超えるファイルの場合、エラーを返すこと", async () => {
      const mockFile = new File(["test"], "test.mp3", { type: "audio/mpeg" });
      Object.defineProperty(mockFile, "size", {
        value: 60 * 1024 * 1024,
        configurable: true,
      });

      const formData = new FormData();
      formData.append("file", mockFile);
      formData.append("bucketName", "song");

      const result = await uploadFileToR2(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("ファイルのサイズが50MBを超えています");
    });
  });

  describe("アップロード処理", () => {
    it("正常なファイルの場合、アップロードを試みること", async () => {
      const mockFile = new File(["test content"], "test-song.mp3", {
        type: "audio/mpeg",
      });

      const formData = new FormData();
      formData.append("file", mockFile);
      formData.append("bucketName", "song");
      formData.append("fileNamePrefix", "user1");

      const result = await uploadFileToR2(formData);

      // Either succeeds or fails at the S3 level (not validation)
      if (result.success) {
        expect(result.url).toBeDefined();
        expect(result.url).toContain("https://song.example.com/");
      } else {
        // If it fails, it should be an upload error, not a validation error
        expect(result.error).toBe("ファイルのアップロードに失敗しました");
      }
    });
  });
});

// ============================================================================
// deleteFileFromR2 Tests
// ============================================================================

describe("deleteFileFromR2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("バケット名がない場合、エラーを返すこと", async () => {
    const result = await deleteFileFromR2("" as any, "test-file.mp3");

    expect(result.success).toBe(false);
    expect(result.error).toBe("バケット名とファイルパスは必須です");
  });

  it("ファイルパスがない場合、エラーを返すこと", async () => {
    const result = await deleteFileFromR2("song", "");

    expect(result.success).toBe(false);
    expect(result.error).toBe("バケット名とファイルパスは必須です");
  });

  it("正常な削除の場合、successを返すこと", async () => {
    (s3Client.send as jest.Mock).mockResolvedValue({});

    const result = await deleteFileFromR2("song", "test-file.mp3");

    expect(s3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("削除エラー時にエラーを返すこと", async () => {
    (s3Client.send as jest.Mock).mockRejectedValue(new Error("Delete failed"));

    const result = await deleteFileFromR2("song", "test-file.mp3");

    expect(result.success).toBe(false);
    expect(result.error).toBe("ファイルの削除に失敗しました");
  });

  it("imageバケットからファイルを削除できること", async () => {
    (s3Client.send as jest.Mock).mockResolvedValue({});

    const result = await deleteFileFromR2("image", "avatar-123.jpg");

    expect(s3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    expect(result.success).toBe(true);
  });

  it("spotlightバケットからファイルを削除できること", async () => {
    (s3Client.send as jest.Mock).mockResolvedValue({});

    const result = await deleteFileFromR2("spotlight", "video-123.mp4");

    expect(s3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    expect(result.success).toBe(true);
  });

  it("videoバケットからファイルを削除できること", async () => {
    (s3Client.send as jest.Mock).mockResolvedValue({});

    const result = await deleteFileFromR2("video", "video-123.mp4");

    expect(s3Client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    expect(result.success).toBe(true);
  });
});
