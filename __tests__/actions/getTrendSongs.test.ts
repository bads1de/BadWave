import getTrendSongs from "@/actions/getTrendSongs";
import { createClient } from "@/libs/supabase/server";
import { subMonths, subWeeks, subDays } from "date-fns";

jest.mock("@/libs/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("actions/getTrendSongs", () => {
  let mockSupabase: any;
  let mockLimit: jest.Mock;
  let mockOrder: jest.Mock;
  let mockFilter: jest.Mock;

  beforeEach(() => {
    mockLimit = jest.fn();
    mockOrder = jest.fn(() => ({ limit: mockLimit }));
    mockFilter = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ 
      order: mockOrder,
      filter: mockFilter 
    }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    
    // Use fake timers to stabilize date calculations if necessary,
    // but subMonths etc are deterministic relative to 'now'.
    // Jest timer mocks affect Date.now()
    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should fetch all trends by default", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs();

    expect(mockSupabase.from).toHaveBeenCalledWith("songs");
    expect(mockFilter).not.toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith("count", { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it("should filter by month", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs("month");

    expect(mockFilter).toHaveBeenCalledWith(
      "created_at", 
      "gte", 
      subMonths(new Date(), 1).toISOString()
    );
  });

  it("should filter by week", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs("week");

    expect(mockFilter).toHaveBeenCalledWith(
      "created_at", 
      "gte", 
      subWeeks(new Date(), 1).toISOString()
    );
  });

  it("should filter by day", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs("day");

    expect(mockFilter).toHaveBeenCalledWith(
      "created_at", 
      "gte", 
      subDays(new Date(), 1).toISOString()
    );
  });
});
