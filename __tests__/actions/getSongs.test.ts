import getSongs from "@/actions/getSongs";
import { createClient } from "@/libs/supabase/server";

// Mock libs/supabase/server
jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getSongs", () => {
  let mockSupabase: any;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    // Setup generic mock chain
    mockLimit = jest.fn();
    const mockOrder = jest.fn(() => ({ limit: mockLimit }));
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));
    
    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return songs list on success", async () => {
    const mockSongs = [
      { id: "1", title: "Song 1", author: "Author 1" },
      { id: "2", title: "Song 2", author: "Author 2" },
    ];

    mockLimit.mockResolvedValue({
      data: mockSongs,
      error: null,
    });

    const result = await getSongs();

    expect(createClient).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("songs");
    // Verify chain calls if needed, but return value check is most important
    expect(result).toEqual(mockSongs);
  });

  it("should return empty array if data is null", async () => {
    mockLimit.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await getSongs();
    expect(result).toEqual([]);
  });

  it("should throw error on failure", async () => {
    const mockError = { message: "Database error" };
    mockLimit.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(getSongs()).rejects.toThrow("Database error");

    expect(consoleSpy).toHaveBeenCalledWith("Error fetching songs:", "Database error");
    consoleSpy.mockRestore();
  });
});
