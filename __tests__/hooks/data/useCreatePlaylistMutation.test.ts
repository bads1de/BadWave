import { renderHook, waitFor } from "@testing-library/react";
import useCreatePlaylistMutation from "@/hooks/data/useCreatePlaylistMutation";
import { createClient } from "@/libs/supabase/client";
import { renderHookWithQueryClient } from "../../test-utils"; // Correct path

// Mock dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ userDetails: { id: "user-1", full_name: "Test User" } }),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("hooks/data/useCreatePlaylistMutation", () => {
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
  });

  it("should create playlist successfully", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const { result } = renderHookWithQueryClient(() => 
      useCreatePlaylistMutation({ onClose: mockOnClose })
    );

    await result.current.mutateAsync({ title: "New Playlist" });

    expect(mockSupabase.from).toHaveBeenCalledWith("playlists");
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      title: "New Playlist",
      user_id: "user-1",
      user_name: "Test User",
      is_public: false,
    }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should handle error", async () => {
    mockInsert.mockResolvedValue({ error: { message: "DB Error" } });

    const { result } = renderHookWithQueryClient(() => 
      useCreatePlaylistMutation({ onClose: mockOnClose })
    );

    await expect(result.current.mutateAsync({ title: "Fail" }))
      .rejects.toThrow("DB Error");
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
