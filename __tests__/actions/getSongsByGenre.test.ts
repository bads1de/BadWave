import getSongsByGenre from "@/actions/getSongsByGenre";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getSongsByGenre", () => {
  let mockSupabase: { from: jest.Mock };
  let mockOrder: jest.Mock;
  let mockOr: jest.Mock;

  beforeEach(() => {
    mockOrder = jest.fn();
    mockOr = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ or: mockOr }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should fetch songs for single genre string", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    await getSongsByGenre("Pop");

    // "Pop" -> split -> ["Pop"] -> "genre.ilike.%Pop%"
    expect(mockOr).toHaveBeenCalledWith("genre.ilike.%Pop%");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("should fetch songs for multiple genres (comma string)", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    await getSongsByGenre("Pop, Rock");

    // "Pop, Rock" -> split -> ["Pop", "Rock"] -> "genre.ilike.%Pop%,genre.ilike.%Rock%"
    expect(mockOr).toHaveBeenCalledWith("genre.ilike.%Pop%,genre.ilike.%Rock%");
  });

  it("should fetch songs for multiple genres (array)", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    await getSongsByGenre(["Jazz", "Blues"]);

    // ["Jazz", "Blues"] -> "genre.ilike.%Jazz%,genre.ilike.%Blues%"
    expect(mockOr).toHaveBeenCalledWith("genre.ilike.%Jazz%,genre.ilike.%Blues%");
  });

  it("should return an empty array without querying when the genre is empty", async () => {
    const result = await getSongsByGenre("");

    expect(result).toEqual([]);
    expect(createClient).not.toHaveBeenCalled();
    expect(mockOr).not.toHaveBeenCalled();
  });

  it("should ignore blank entries instead of matching every song", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    await getSongsByGenre(["Pop", "  "]);

    // 空要素が残ると "genre.ilike.%%" になり全件ヒットしてしまう
    expect(mockOr).toHaveBeenCalledWith("genre.ilike.%Pop%");
  });
});
