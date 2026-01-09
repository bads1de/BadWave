import { uploadFileToR2, deleteFileFromR2 } from "@/actions/r2";
import s3Client from "@/libs/s3";
import { requireAdmin } from "@/libs/admin";

// Mock dependencies
jest.mock("@/libs/s3", () => ({
  send: jest.fn(),
}));

jest.mock("@/libs/admin", () => ({
  requireAdmin: jest.fn(),
}));

jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

describe("actions/r2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.R2_SONG_URL = "https://r2.example.com";
  });

  describe("uploadFileToR2", () => {
    it("uploads file successfully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (requireAdmin as jest.Mock).mockResolvedValue(true);
      (s3Client.send as jest.Mock).mockResolvedValue({});

      // Mock File with arrayBuffer
      const file = {
        name: "test.mp3",
        type: "audio/mpeg",
        size: 1024,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as unknown as File;

      const formData = new FormData();
      // Override get to return our file object directly
      formData.get = jest.fn((key: string) => {
        if (key === "file") return file;
        if (key === "bucketName") return "song";
        if (key === "fileNamePrefix") return "prefix";
        return null;
      }) as any;

      const result = await uploadFileToR2(formData);

      if (!result.success) {
         console.log("Test failed with error:", result.error);
      }

      expect(requireAdmin).toHaveBeenCalled();
      expect(s3Client.send).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.url).toContain("https://r2.example.com");
      
      consoleSpy.mockRestore();
    });

    it("fails if file is missing", async () => {
      const formData = new FormData();
      formData.append("bucketName", "song");

      const result = await uploadFileToR2(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("ファイルとバケット名は必須です");
    });

    it("fails if file too large", async () => {
      (requireAdmin as jest.Mock).mockResolvedValue(true);
      
      // Mock large file
      const largeFile = {
        name: "large.mp3",
        size: 60 * 1024 * 1024, // 60MB
        arrayBuffer: jest.fn(),
      } as unknown as File;
      
      const formData = new FormData();
      // Override get for large file test
      formData.get = jest.fn((key: string) => {
        if (key === "file") return largeFile;
        if (key === "bucketName") return "song";
        return null;
      }) as any;

      const result = await uploadFileToR2(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("ファイルのサイズが50MBを超えています");
    });
  });

  describe("deleteFileFromR2", () => {
    it("deletes file successfully", async () => {
      (requireAdmin as jest.Mock).mockResolvedValue(true);
      (s3Client.send as jest.Mock).mockResolvedValue({});

      const result = await deleteFileFromR2("song", "file-key");

      expect(requireAdmin).toHaveBeenCalled();
      expect(s3Client.send).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("fails if params missing", async () => {
      (requireAdmin as jest.Mock).mockResolvedValue(true);

      const result = await deleteFileFromR2("song", "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("バケット名とファイルパスは必須です");
    });
  });
});