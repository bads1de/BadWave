import { renderHook, waitFor } from "@testing-library/react";
import useSpotlightUploadMutation from "@/hooks/data/useSpotlightUploadMutation";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils";
import { checkIsAdmin } from "@/actions/checkAdmin";
import { uploadFileToR2 } from "@/actions/r2";

// Mock dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/actions/checkAdmin");
jest.mock("@/actions/r2");
jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" } }),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock AWS SDK
jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  S3Client: jest.fn(() => ({ send: jest.fn() })),
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
    
    (uploadFileToR2 as jest.Mock).mockResolvedValue({ success: true, url: "video-url" });
  });

  it("should fail if not admin", async () => {
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: false });

    const { result } = renderHookWithQueryClient(() => 
      useSpotlightUploadMutation({ onClose: mockOnClose })
    );

    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await expect(result.current.mutateAsync({ 
      title: "Title", 
      author: "Author",
      genre: "Genre", 
      description: "Desc",
      videoFile: file 
    })).rejects.toThrow("管理者権限が必要です");
    
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("should upload spotlight if admin", async () => {
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: true });
    mockInsert.mockResolvedValue({ error: null });

    const { result } = renderHookWithQueryClient(() => 
      useSpotlightUploadMutation({ onClose: mockOnClose })
    );

    const file = new File([""], "video.mp4", { type: "video/mp4" });
    await result.current.mutateAsync({ 
      title: "Title", 
      author: "Author",
      genre: "Genre", 
      description: "Desc",
      videoFile: file 
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
});
