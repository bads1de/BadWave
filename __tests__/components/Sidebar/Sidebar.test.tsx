import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import usePlayer from "@/hooks/player/usePlayer";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock hooks
jest.mock("@/hooks/auth/useUser");
jest.mock("@/hooks/player/usePlayer");

// Mock child components to isolate Sidebar logic
jest.mock("@/components/Sidebar/SidebarItem", () => {
  return {
    __esModule: true,
    default: ({ label, active }: any) => {
      const React = require("react");
      return React.createElement("div", {
        "data-testid": `sidebar-item-${label}`,
        "data-active": active,
      }, label);
    },
  };
});

jest.mock("@/components/Sidebar/Studio", () => {
  return {
    __esModule: true,
    default: () => {
      const React = require("react");
      return React.createElement("div", { "data-testid": "library-component" }, "Library Component");
    },
  };
});

jest.mock("@/components/Sidebar/UserCard", () => {
  return {
    __esModule: true,
    default: () => {
      const React = require("react");
      return React.createElement("div", { "data-testid": "user-card" }, "UserCard");
    },
  };
});

jest.mock("@/components/common/Box", () => {
  return {
    __esModule: true,
    default: ({ children, className }: any) => {
      const React = require("react");
      return React.createElement("div", { className, "data-testid": "box" }, children);
    },
  };
});

describe("components/Sidebar/Sidebar", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (usePlayer as unknown as jest.Mock).mockReturnValue({ activeId: undefined });
    (useUser as jest.Mock).mockReturnValue({ 
      user: null, 
      userDetails: null 
    });
  });

  it("renders navigation items", () => {
    render(
      <Sidebar>
        <div data-testid="child-content">Main Content</div>
      </Sidebar>
    );

    expect(screen.getByTestId("sidebar-item-Home")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-Search")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-Pulse")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("highlights active route", () => {
    (usePathname as jest.Mock).mockReturnValue("/search");
    
    render(
      <Sidebar>
        <div />
      </Sidebar>
    );

    const searchItem = screen.getByTestId("sidebar-item-Search");
    expect(searchItem).toHaveAttribute("data-active", "true");
    
    const homeItem = screen.getByTestId("sidebar-item-Home");
    expect(homeItem).toHaveAttribute("data-active", "false");
  });

  it("shows library section when user is logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ 
      user: { id: "user-1" },
      userDetails: { full_name: "Test User" }
    });

    render(
      <Sidebar>
        <div />
      </Sidebar>
    );

    // Check for library popover trigger content (text "Library")
    expect(screen.getByText("Library")).toBeInTheDocument();
  });

  it("adjusts height when player is active", () => {
    (usePlayer as unknown as jest.Mock).mockReturnValue({ activeId: "song-1" });
    
    const { container } = render(
      <Sidebar>
        <div />
      </Sidebar>
    );

    // The root div should have h-[calc(100%-80px)] class when player is active
    // Note: We need to check the first child or the container itself depending on render output.
    // render() returns a container that wraps the component.
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain("h-[calc(100%-80px)]");
  });

  it("does not adjust height on pulse page even if player active", () => {
    (usePlayer as unknown as jest.Mock).mockReturnValue({ activeId: "song-1" });
    (usePathname as jest.Mock).mockReturnValue("/pulse");

    const { container } = render(
      <Sidebar>
        <div />
      </Sidebar>
    );

    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).not.toContain("h-[calc(100%-80px)]");
  });
});