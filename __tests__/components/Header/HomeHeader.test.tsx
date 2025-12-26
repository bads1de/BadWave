import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomeHeader from "@/components/Header/HomeHeader";
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/auth/useAuthModal";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@/hooks/auth/useUser");
jest.mock("@/hooks/auth/useAuthModal");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/libs/supabase/client");
jest.mock("react-hot-toast");

// Mock Lucide icons
jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    User: () => React.createElement("div", { "data-testid": "user-icon" }),
    LogOut: () => React.createElement("div", { "data-testid": "logout-icon" }),
    Menu: () => React.createElement("div", { "data-testid": "menu-icon" }),
    X: () => React.createElement("div", { "data-testid": "x-icon" }),
    Home: () => React.createElement("div", { "data-testid": "home-icon" }),
    Search: () => React.createElement("div", { "data-testid": "search-icon" }),
    Settings: () =>
      React.createElement("div", { "data-testid": "settings-icon" }),
  };
});

// Mock react-icons
jest.mock("react-icons/ri", () => {
  const React = require("react");
  return {
    RiPlayListFill: () =>
      React.createElement("div", { "data-testid": "playlist-icon" }),
  };
});
jest.mock("react-icons/fa", () => {
  const React = require("react");
  return {
    FaHeart: () => React.createElement("div", { "data-testid": "heart-icon" }),
  };
});

describe("HomeHeader", () => {
  const mockRouter = { push: jest.fn(), refresh: jest.fn() };
  const mockAuthModal = { onOpen: jest.fn() };
  const mockSupabase = {
    auth: { signOut: jest.fn().mockResolvedValue({ error: null }) },
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuthModal as unknown as jest.Mock).mockReturnValue(mockAuthModal);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  it("renders login/register buttons when not logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    render(<HomeHeader />);

    expect(screen.getByText("ログイン")).toBeInTheDocument();
    expect(screen.getByText("新規登録")).toBeInTheDocument();
  });

  it("renders user profile when logged in", () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1" },
      userDetails: { avatar_url: "avatar.jpg" },
    });

    render(<HomeHeader />);

    const avatar = screen.getByAltText("ユーザーアバター");
    expect(avatar).toBeInTheDocument();
  });

  it("opens auth modal when login is clicked", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });

    render(<HomeHeader />);

    fireEvent.click(screen.getByText("ログイン"));
    expect(mockAuthModal.onOpen).toHaveBeenCalled();
  });

  it("toggles mobile menu on click", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });

    render(<HomeHeader />);

    const menuBtn = screen.getByTestId("menu-icon").parentElement!;
    fireEvent.click(menuBtn);

    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.getByText("ホーム")).toBeInTheDocument();
  });

  it("handles logout", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });

    render(<HomeHeader />);

    // Open menu first
    fireEvent.click(screen.getByTestId("menu-icon").parentElement!);

    const logoutBtn = screen.getByText("ログアウト");
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });
});
