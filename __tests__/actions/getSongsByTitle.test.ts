import getSongsByTitle from "@/actions/getSongsByTitle";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getSongsByTitle", () => {
  let mockSupabase: any;
  let mockIlike: jest.Mock;
  let mockOrder: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    mockLimit = jest.fn();
    mockIlike = jest.fn(() => ({ limit: mockLimit }));
    mockOrder = jest.fn(() => ({ limit: mockLimit, ilike: mockIlike }));
    
    // Default setup: select -> order -> [ilike] -> limit
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should fetch songs matching title", async () => {
    const mockSongs = [{ id: "1", title: "Test Song" }];
    mockLimit.mockResolvedValue({ data: mockSongs, error: null });

    const result = await getSongsByTitle("Test");

    expect(createClient).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("songs");
    expect(mockOrder).toHaveBeenCalled();
    expect(mockIlike).toHaveBeenCalledWith("title", "%Test%");
    expect(mockLimit).toHaveBeenCalledWith(20);
    expect(result).toEqual({ songs: mockSongs });
  });

  it("should fetch all songs if title is empty", async () => {
    const mockSongs = [{ id: "1", title: "Song" }];
    mockLimit.mockResolvedValue({ data: mockSongs, error: null });

    const result = await getSongsByTitle("");

    expect(mockIlike).not.toHaveBeenCalled();
    expect(result).toEqual({ songs: mockSongs });
  });

  it("should handle error", async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: "Error" } });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(getSongsByTitle("fail")).rejects.toThrow("Error");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
