"use client";

import React, { useState, memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import useStats from "@/hooks/data/useStats";
import useColorSchemeStore from "@/hooks/stores/useColorSchemeStore";
import { type StatsPeriod } from "@/types/stats";
import { Flame, Clock, Music, TrendingUp, Calendar } from "lucide-react";
import ContributionHeatmap from "./ContributionHeatmap";

const PERIODS = [
  { value: "week" as const, label: "週間" },
  { value: "month" as const, label: "月間" },
  { value: "all" as const, label: "全期間" },
];

// パイチャート用カラーパレット
const GENRE_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#84cc16",
];

const StatsOverview: React.FC = memo(() => {
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const { stats, isLoading } = useStats(period);
  const { getColorScheme, hasHydrated } = useColorSchemeStore();
  const colorScheme = getColorScheme();

  // 時間帯データを0-23時で整形
  const hourlyData = React.useMemo(() => {
    if (!stats?.hourly_activity) return [];
    const fullData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}H`,
      count: 0,
    }));
    stats.hourly_activity.forEach((item) => {
      fullData[item.hour].count = item.count;
    });
    return fullData;
  }, [stats?.hourly_activity]);

  // サマリーデータ
  const totalPlays = React.useMemo(() => {
    return (
      stats?.hourly_activity?.reduce((sum, item) => sum + item.count, 0) ?? 0
    );
  }, [stats?.hourly_activity]);

  const streak = stats?.streak ?? 0;

  const topGenre = React.useMemo(() => {
    if (!stats?.genre_stats || stats.genre_stats.length === 0) return "NONE";
    return stats.genre_stats[0].genre.toUpperCase();
  }, [stats?.genre_stats]);

  // ジャンルデータをrecharts用に整形
  const genreData = React.useMemo(() => {
    if (!stats?.genre_stats) return [];
    return stats.genre_stats.map((item) => ({
      name: item.genre.toUpperCase(),
      value: item.count,
    }));
  }, [stats?.genre_stats]);

  // 曜日別データを整形 (0=日曜 ~ 6=土曜)
  const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const weeklyData = React.useMemo(() => {
    const fullData = DAY_NAMES.map((name) => ({ day: name, count: 0 }));
    if (!stats?.weekly_activity) return fullData;
    stats.weekly_activity.forEach((item) => {
      fullData[item.day_of_week].count = item.count;
    });
    return fullData;
  }, [stats?.weekly_activity]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* サマリーカードスケルトン */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0a0a0f]/40 border border-theme-500/20 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-theme-900/50 rounded w-1/2 mb-2" />
              <div className="h-8 bg-theme-900/50 rounded w-3/4" />
            </div>
          ))}
        </div>
        {/* チャートスケルトン */}
        <div className="bg-[#0a0a0f]/40 border border-theme-500/20 rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-theme-900/50 rounded w-1/4 mb-4" />
          <div className="h-48 bg-theme-900/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono">
      {/* 期間切り替え (HUD Style) */}
      <div className="flex justify-end">
        <div className="inline-flex h-12 items-center rounded-none bg-[#0a0a0f]/60 backdrop-blur-xl border border-theme-500/30 p-1 shadow-[inset_0_0_10px_rgba(var(--theme-500),0.1)]">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`
                inline-flex items-center justify-center whitespace-nowrap
                px-6 py-2 text-xs font-bold uppercase tracking-widest
                transition-all duration-500 relative overflow-hidden
                ${
                  period === p.value
                    ? "text-white cyber-glitch"
                    : "text-theme-500/60 hover:text-theme-300 hover:bg-theme-500/5"
                }
              `}
              style={
                period === p.value && hasHydrated
                  ? {
                      background: `rgba(var(--theme-500), 0.15)`,
                      boxShadow: `0 0 15px rgba(var(--theme-500), 0.3)`,
                      border: `1px solid rgba(var(--theme-500), 0.5)`,
                    }
                  : undefined
              }
            >
              {period === p.value && (
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
              )}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* サマリーカード (HUD Modules) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Music, label: "TOTAL_PLAYS", value: totalPlays },
          { icon: Flame, label: "STREAK_LOG", value: `${streak}d` },
          { icon: TrendingUp, label: "TOP_GENRE", value: topGenre },
          {
            icon: Clock,
            label: "TRACK_COUNT",
            value: stats?.top_songs?.length ?? 0,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative group overflow-hidden bg-[#0a0a0f]/80 backdrop-blur-xl border border-theme-500/20 p-5 shadow-[inset_0_0_15px_rgba(var(--theme-500),0.05)] hover:border-theme-500/50 hover:shadow-[0_0_20px_rgba(var(--theme-500),0.1)] transition-all duration-500"
          >
            {/* 装飾 */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500/40" />

            <div className="flex items-center gap-2 text-theme-500 text-[10px] tracking-widest uppercase mb-2 group-hover:text-theme-300 transition-colors">
              <item.icon className="w-3 h-3" />
              {item.label}
            </div>
            <div className="text-2xl font-bold text-white tracking-tighter uppercase break-all drop-shadow-[0_0_8px_rgba(var(--theme-500),0.3)]">
              {item.value}
            </div>
            <div className="mt-2 h-0.5 w-full bg-theme-500/10 overflow-hidden">
              <div className="h-full bg-theme-500/40 w-1/3 group-hover:w-full transition-all duration-1000" />
            </div>
          </div>
        ))}
      </div>

      {/* チャートセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 時間帯別アクティビティ */}
        <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-theme-500/20 p-6 relative group">
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-theme-500/30" />
          <h3 className="text-xs font-bold text-theme-300 mb-6 tracking-[0.3em] uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-theme-500 rounded-full animate-pulse" />
            HOURLY_ACTIVITY_MONITOR
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(var(--theme-500), 0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  stroke="rgba(var(--theme-500), 0.4)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={5}
                />
                <YAxis
                  stroke="rgba(var(--theme-500), 0.4)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(var(--theme-500), 0.1)" }}
                  contentStyle={{
                    backgroundColor: "#0a0a0f",
                    border: "1px solid rgba(var(--theme-500), 0.5)",
                    borderRadius: "0px",
                    fontFamily: "monospace",
                    fontSize: "10px",
                  }}
                  itemStyle={{ color: "white" }}
                />
                <Bar
                  dataKey="count"
                  fill={hasHydrated ? `rgba(var(--theme-500), 0.6)` : "#8b5cf6"}
                  radius={[0, 0, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ジャンル分布 */}
        <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-theme-500/20 p-6 relative group">
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-theme-500/30" />
          <h3 className="text-xs font-bold text-theme-300 mb-6 tracking-[0.3em] uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-theme-500 rounded-full animate-pulse" />
            GENRE_DISTRIBUTION_ANALYSIS
          </h3>
          <div className="h-64">
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {genreData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                        style={{
                          filter: "drop-shadow(0 0 5px rgba(255,255,255,0.2))",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a0f",
                      border: "1px solid rgba(var(--theme-500), 0.5)",
                      borderRadius: "0px",
                      fontFamily: "monospace",
                      fontSize: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-theme-500/40 text-xs tracking-widest">
                [ NO_DATA_AVAILABLE ]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 曜日別アクティビティ */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-theme-500/20 p-6 relative group">
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-theme-500/30" />
        <h3 className="text-xs font-bold text-theme-300 mb-6 tracking-[0.3em] uppercase flex items-center gap-2">
          <Calendar className="w-4 h-4 text-theme-500" />
          WEEKLY_STREAM_METRICS
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(var(--theme-500), 0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="rgba(var(--theme-500), 0.4)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(var(--theme-500), 0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(var(--theme-500), 0.1)" }}
                contentStyle={{
                  backgroundColor: "#0a0a0f",
                  border: "1px solid rgba(var(--theme-500), 0.5)",
                  borderRadius: "0px",
                  fontFamily: "monospace",
                  fontSize: "10px",
                }}
              />
              <Bar
                dataKey="count"
                fill={hasHydrated ? `rgba(var(--theme-500), 0.4)` : "#06b6d4"}
                stroke={`rgba(var(--theme-500), 0.8)`}
                strokeWidth={1}
                radius={[0, 0, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 装飾用HUDライン */}
        <div className="absolute bottom-4 right-4 text-[8px] text-theme-500/40 font-mono">
          METRIC_SYSTEM_v2.0 // BYPASS_ENCRYPTION_TRUE
        </div>
      </div>

      {/* コントリビューションヒートマップ */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-500/30 to-transparent" />
        <ContributionHeatmap
          dailyActivity={stats?.daily_activity ?? null}
          colorScheme={hasHydrated ? colorScheme : undefined}
        />
      </div>
    </div>
  );
});

StatsOverview.displayName = "StatsOverview";

export default StatsOverview;
