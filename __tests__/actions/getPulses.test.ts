import getPulses from "@/actions/getPulses";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getPulses", () => {
  let mockSupabase: { from: jest.Mock };
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

  it("should fetch pulses", async () => {
    const mockData = [{ id: "1", title: "Pulse Item" }];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const result = await getPulses();

    expect(mockSupabase.from).toHaveBeenCalledWith("pulses");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual(mockData);
  });

  it("should handle error", async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: "Error" } });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(getPulses()).rejects.toThrow("Error");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});