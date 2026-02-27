import * as React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccountContent from "@/app/account/components/AccountContent";

// モックの設定
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn(),
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
  return function DummyColorSchemeSelector() {
    return <div data-testid="color-scheme-selector">ColorSchemeSelector</div>;
  };
});

jest.mock("@/app/account/components/TopPlayedSongs", () => {
  return function DummyTopPlayedSongs() {
    return <div data-testid="top-played-songs">TopPlayedSongs</div>;
  };
});

jest.mock("@/app/account/components/StatsOverview", () => {
  return function DummyStatsOverview() {
    return <div data-testid="stats-overview">StatsOverview</div>;
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
    expect(screen.getByText("[ AUTHENTICATED_OPERATOR ]")).toBeInTheDocument();
  });

  it("タブメニューに全ての項目が存在すること", () => {
    renderComponent();
    expect(screen.getByText("[ Visuals ]")).toBeInTheDocument();
    expect(screen.getByText("[ Stream_Log ]")).toBeInTheDocument();
    expect(screen.getByText("[ Analytics ]")).toBeInTheDocument();
  });
});
