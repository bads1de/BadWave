import { PutObjectCommand } from "@aws-sdk/client-s3";
import { toast } from "react-hot-toast";
import uploadFileToR2 from "@/actions/uploadFileToR2";
import s3Client from "@/libs/s3";

// モックの設定
jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("@/libs/s3", () => ({
  send: jest.fn(),
}));

describe("uploadFileToR2", () => {
  const createMockFile = (size: number) => {
    const file = new File(["test-content"], "test-song", {
      type: "audio/mpeg",
    });
    Object.defineProperty(file, "size", { value: size, configurable: true });
    return file;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_R2_SONG_URL = "https://song.example.com";
  });

  it("50MBを超えるファイルの場合、エラーを表示してnullを返すこと", async () => {
    const mockFile = createMockFile(60 * 1024 * 1024);

    const result = await uploadFileToR2({
      file: mockFile,
      bucketName: "song",
      fileType: "audio",
    });

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      "ファイルのサイズが50MBを超えています"
    );
  });

  it("正常なアップロードの場合、URLを返すこと", async () => {
    const mockFile = createMockFile(10 * 1024 * 1024);
    (s3Client.send as jest.Mock).mockResolvedValue({});

    const result = await uploadFileToR2({
      file: mockFile,
      bucketName: "song",
      fileType: "audio",
      fileNamePrefix: "user1",
    });

    expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(result).toContain("https://song.example.com/user1-test-song-");
  });

  it("アップロードエラー時にエラーメッセージを表示し、nullを返すこと", async () => {
    const mockFile = createMockFile(10 * 1024 * 1024);
    (s3Client.send as jest.Mock).mockRejectedValue(new Error("Upload failed"));

    const result = await uploadFileToR2({
      file: mockFile,
      bucketName: "song",
      fileType: "audio",
    });

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      "オーディオのアップロードに失敗しました"
    );
  });
});
