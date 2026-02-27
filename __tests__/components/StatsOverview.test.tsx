import React from "react";
import { render } from "@testing-library/react";
import StatsOverview from "@/app/account/components/StatsOverview";

// Mock dependencies
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div>Cell</div>,
}));

jest.mock("lucide-react", () => ({
  Flame: () => <div data-testid="flame-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Music: () => <div data-testid="music-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
}));

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

jest.mock("./ContributionHeatmap", () => ({
  __esModule: true,
  default: () => <div data-testid="contribution-heatmap" />,
}));

describe("StatsOverview", () => {
  it("should render without crashing", () => {
    const { getByText } = render(<StatsOverview />);
    expect(getByText(/TOTAL_PLAYS/i)).toBeInTheDocument();
  });
});
