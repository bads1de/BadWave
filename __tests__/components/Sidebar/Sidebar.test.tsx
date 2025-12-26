import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { usePathname } from "next/navigation";
import usePlayer from "@/hooks/player/usePlayer";
import { useUser } from "@/hooks/auth/useUser";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/hooks/player/usePlayer", () => {
  const mockState = { activeId: null };
  const fn = (selector: any) => (selector ? selector(mockState) : mockState);
  Object.assign(fn, mockState);
  return { __esModule: true, default: fn };
});

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/components/Sidebar/Studio", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () =>
      React.createElement("div", { "data-testid": "studio-library" }),
  };
});

jest.mock("@/components/Sidebar/UserCard", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: () => React.createElement("div", { "data-testid": "user-card" }),
  };
});

// Mock UI components from shadcn/ui if needed
jest.mock("@/components/ui/popover", () => {
  const React = require("react");
  return {
    Popover: ({ children }: any) => React.createElement("div", null, children),
    PopoverTrigger: ({ children }: any) =>
      React.createElement("div", null, children),
    PopoverContent: ({ children }: any) =>
      React.createElement(
        "div",
        { "data-testid": "popover-content" },
        children
      ),
  };
});

describe("Sidebar", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (useUser as jest.Mock).mockReturnValue({ user: null, userDetails: null });
    jest.clearAllMocks();
  });

  it("renders sidebar with home and search links", () => {
    render(<Sidebar>Content</Sidebar>);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByTestId("studio-library")).toBeInTheDocument();
    expect(screen.getByTestId("user-card")).toBeInTheDocument();
  });

  it("collapses and expands the sidebar", () => {
    render(<Sidebar>Content</Sidebar>);

    const collapseBtn = screen.getByRole("button");
    fireEvent.click(collapseBtn);

    // In collapsed mode, text for "Home" might be hidden via css or conditional rendering
    // In this implementation, SidebarItem handles isCollapsed.
    // Let's check for the logo width change if possible, but it's hard to test computed styles in JSDOM easily.
    // Instead, let's check if "BadWave" text is gone (it's conditionally rendered in line 92).
    expect(screen.queryByText("BadWave")).not.toBeInTheDocument();

    fireEvent.click(collapseBtn);
    expect(screen.getByText("BadWave")).toBeInTheDocument();
  });

  it("renders library and liked links when logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "1" } });
    render(<Sidebar>Content</Sidebar>);

    expect(screen.getByText("Library")).toBeInTheDocument();
  });

  it("renders children in main content area", () => {
    render(
      <Sidebar>
        <div data-testid="child-content">Child</div>
      </Sidebar>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
