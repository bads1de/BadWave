import * as React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccountContent from "@/app/account/components/AccountContent";

// モックの設定
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({
    userDetails: {
      full_name: "Test User",
      avatar_url: "/test-avatar.png",
    },
    isLoading: false,
  }),
}));

// Components inside AccountContent that might need mocking
jest.mock("@/app/account/components/ColorSchemeSelector", () => {
  const React = require("react");
  return function DummyColorSchemeSelector() {
    return React.createElement("div", { "data-testid": "color-scheme-selector" }, "ColorSchemeSelector");
  };
});

jest.mock("@/app/account/components/TopPlayedSongs", () => {
  const React = require("react");
  return function DummyTopPlayedSongs() {
    return React.createElement("div", { "data-testid": "top-played-songs" }, "TopPlayedSongs");
  };
});

jest.mock("@/app/account/components/StatsOverview", () => {
  const React = require("react");
  return function DummyStatsOverview() {
    return React.createElement("div", { "data-testid": "stats-overview" }, "StatsOverview");
  };
});

describe("AccountContent", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AccountContent />
      </QueryClientProvider>,
    );
  };

  it("ユーザー情報が正しく表示されること", () => {
    renderComponent();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("[ AUTH_OPERATOR ]")).toBeInTheDocument();
  });

  it("タブメニューに全ての項目が存在すること", () => {
    renderComponent();
    expect(screen.getByText("[ VISUALS ]")).toBeInTheDocument();
    expect(screen.getByText("[ STREAM_LOG ]")).toBeInTheDocument();
    expect(screen.getByText("[ ANALYTICS ]")).toBeInTheDocument();
  });
});
