import { renderHook, waitFor } from "@testing-library/react";
import useDeleteSongMutation from "@/hooks/data/useDeleteSongMutation";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils";
import { checkIsAdmin } from "@/actions/checkAdmin";
import { deleteFileFromR2 } from "@/actions/r2";

// Mock AWS SDK to avoid runtime issues
jest.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  S3Client: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

// Mock dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/actions/checkAdmin");
jest.mock("@/actions/r2");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" } }),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("hooks/data/useDeleteSongMutation", () => {
  let mockSupabase: any;
  let mockDelete: jest.Mock;
  let mockSelect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect = jest.fn();
    mockDelete = jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: mockSelect,
        })),
      })),
    }));

    mockSupabase = {
      from: jest.fn(() => ({
        delete: mockDelete,
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("should fail if not admin", async () => {
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: false });

    const { result } = renderHookWithQueryClient(() => useDeleteSongMutation());

    await expect(result.current.mutateAsync({ songId: "1" }))
      .rejects.toThrow("管理者権限が必要です");
    
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("should delete song and files if admin", async () => {
    (checkIsAdmin as jest.Mock).mockResolvedValue({ isAdmin: true });
    
    // Mock deleted data return
    const deletedSong = { song_path: "path/song.mp3", image_path: "path/img.jpg" };
    mockSelect.mockResolvedValue({ data: [deletedSong], error: null });
    
    (deleteFileFromR2 as jest.Mock).mockResolvedValue({ success: true });

    const { result } = renderHookWithQueryClient(() => useDeleteSongMutation());

    await result.current.mutateAsync({ songId: "1" });

    expect(mockSupabase.from).toHaveBeenCalledWith("songs");
    expect(deleteFileFromR2).toHaveBeenCalledTimes(2); // Song and Image
  });
});
