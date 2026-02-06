import getSongsPaginated from "@/actions/getSongsPaginated";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getSongsPaginated", () => {
  let mockSupabase: any;
  let mockRange: jest.Mock;
  let mockCountSelect: jest.Mock;

  beforeEach(() => {
    mockRange = jest.fn();
    const mockOrder = jest.fn(() => ({ range: mockRange }));
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    
    mockCountSelect = jest.fn();
    
    const mockFrom = jest.fn((table) => {
      if (table === "songs") {
        return {
          select: (query: any, options: any) => {
            if (options && options.count) {
              return mockCountSelect();
            }
            return mockSelect();
          }
        };
      }
      return {};
    });
    
    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return paginated songs", async () => {
    const mockSongs = [{ id: "1", title: "Song 1" }];
    const pageSize = 10;
    const page = 1;

    mockRange.mockResolvedValue({
      data: mockSongs,
      error: null,
    });

    mockCountSelect.mockResolvedValue({
      count: 25,
      error: null,
    });

    const result = await getSongsPaginated(page, pageSize);

    expect(mockRange).toHaveBeenCalledWith(10, 19);
    expect(result).toEqual({
      songs: mockSongs,
      totalCount: 25,
      totalPages: 3,
      currentPage: 1,
    });
  });

  it("should handle db error in songs result", async () => {
    mockRange.mockResolvedValue({
      data: null,
      error: { message: "DB Error" },
    });
    mockCountSelect.mockResolvedValue({
      count: 0,
      error: null,
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    await expect(getSongsPaginated()).rejects.toThrow("DB Error");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
