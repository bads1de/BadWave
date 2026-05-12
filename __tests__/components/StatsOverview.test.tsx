import React from "react";
import { render } from "@testing-library/react";
import StatsOverview from "@/app/account/components/StatsOverview";

// Mock dependencies
jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }: any) => React.createElement("div", null, children),
    BarChart: ({ children }: any) => React.createElement("div", null, children),
    Bar: () => React.createElement("div", null, "Bar"),
    XAxis: () => React.createElement("div", null, "XAxis"),
    YAxis: () => React.createElement("div", null, "YAxis"),
    CartesianGrid: () => React.createElement("div", null, "CartesianGrid"),
    Tooltip: () => React.createElement("div", null, "Tooltip"),
    PieChart: ({ children }: any) => React.createElement("div", null, children),
    Pie: ({ children }: any) => React.createElement("div", null, children),
    Cell: () => React.createElement("div", null, "Cell"),
  };
});

jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    Flame: () => React.createElement("div", { "data-testid": "flame-icon" }),
    Clock: () => React.createElement("div", { "data-testid": "clock-icon" }),
    Music: () => React.createElement("div", { "data-testid": "music-icon" }),
    TrendingUp: () => React.createElement("div", { "data-testid": "trending-up-icon" }),
    Calendar: () => React.createElement("div", { "data-testid": "calendar-icon" }),
  };
});

jest.mock("@/hooks/data/useStats", () => ({
  __esModule: true,
  default: () => ({
    stats: {
      hourly_activity: [],
      streak: 0,
      genre_stats: [],
      weekly_activity: [],
      top_songs: [],
      daily_activity: [],
    },
    isLoading: false,
  }),
}));

jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: () => ({
    getColorScheme: () => ({
      primary: "rgb(139, 92, 246)",
      secondary: "rgb(6, 182, 212)",
    }),
    hasHydrated: true,
  }),
}));

jest.mock("@/app/account/components/ContributionHeatmap", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => React.createElement("div", { "data-testid": "contribution-heatmap" }),
  };
});

describe("StatsOverview", () => {
  it("should render without crashing", () => {
    const { getByText } = render(<StatsOverview />);
    expect(getByText(/TOTAL_PLAYS/i)).toBeInTheDocument();
  });
});
