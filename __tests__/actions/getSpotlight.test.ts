import getSpotlight from "@/actions/getSpotlight";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getSpotlight", () => {
  let mockSupabase: any;
  let mockOrder: jest.Mock;

  beforeEach(() => {
    mockOrder = jest.fn();
    const mockSelect = jest.fn(() => ({ order: mockOrder }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should fetch spotlights", async () => {
    const mockData = [{ id: "1", title: "Spotlight Item" }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await getSpotlight();

    expect(mockSupabase.from).toHaveBeenCalledWith("spotlights");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual(mockData);
  });

  it("should handle error", async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: "Error" } });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(getSpotlight()).rejects.toThrow("Error");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
