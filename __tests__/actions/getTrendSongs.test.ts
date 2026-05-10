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
  let mockGte: jest.Mock;

  beforeEach(() => {
    mockLimit = jest.fn();
    mockOrder = jest.fn(() => ({ limit: mockLimit }));
    mockGte = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({
      order: mockOrder,
      gte: mockGte,
    }));
    const mockFrom = jest.fn(() => ({ select: mockSelect }));

    mockSupabase = {
      from: mockFrom,
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should fetch all trends by default", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs();

    expect(mockSupabase.from).toHaveBeenCalledWith("songs");
    expect(mockGte).not.toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith("count", { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it("should filter by month", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs("month");

    expect(mockGte).toHaveBeenCalledWith(
      "created_at",
      subMonths(new Date(), 1).toISOString()
    );
  });

  it("should filter by week", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs("week");

    expect(mockGte).toHaveBeenCalledWith(
      "created_at",
      subWeeks(new Date(), 1).toISOString()
    );
  });

  it("should filter by day", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    await getTrendSongs("day");

    expect(mockGte).toHaveBeenCalledWith(
      "created_at",
      subDays(new Date(), 1).toISOString()
    );
  });
});
