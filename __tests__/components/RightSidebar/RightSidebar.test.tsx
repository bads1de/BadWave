import { render, screen } from "@testing-library/react";
import RightSidebar from "@/components/RightSidebar/RightSidebar";
import usePlayer from "@/hooks/player/usePlayer";
import useGetSongById from "@/hooks/data/useGetSongById";
import { usePathname } from "next/navigation";

// Mock dependencies
jest.mock("@/hooks/player/usePlayer");
jest.mock("@/hooks/data/useGetSongById");
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/components/RightSidebar/FullScreenLayout", () => {
  return {
    __esModule: true,
    default: () => {
      const React = require("react");
      return React.createElement("div", { "data-testid": "fullscreen-layout" }, "FullScreenLayout");
    },
  };
});

describe("components/RightSidebar/RightSidebar", () => {
  beforeEach(() => {
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      activeId: "song-1",
      getNextSongId: jest.fn(() => "song-2"),
    });

    (useGetSongById as jest.Mock).mockImplementation((id) => {
      if (id === "song-1") {
        return { song: { id: "song-1", title: "Current Song" } };
      }
      if (id === "song-2") {
        return { song: { id: "song-2", title: "Next Song" } };
      }
      return { song: undefined };
    });

    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("renders children content always", () => {
    render(
      <RightSidebar>
        <div data-testid="main-content">Main Content</div>
      </RightSidebar>
    );
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  });

  it("shows sidebar when song is active", () => {
    render(
      <RightSidebar>
        <div />
      </RightSidebar>
    );
    expect(screen.getByTestId("fullscreen-layout")).toBeInTheDocument();
  });

  it("hides sidebar when no song is active", () => {
    (usePlayer as unknown as jest.Mock).mockReturnValue({
      activeId: undefined,
      getNextSongId: jest.fn(),
    });
    (useGetSongById as jest.Mock).mockReturnValue({ song: undefined });

    render(
      <RightSidebar>
        <div />
      </RightSidebar>
    );
    expect(screen.queryByTestId("fullscreen-layout")).not.toBeInTheDocument();
  });

  it("hides sidebar on pulse page even if song is active", () => {
    (usePathname as jest.Mock).mockReturnValue("/pulse");
    
    render(
      <RightSidebar>
        <div />
      </RightSidebar>
    );
    expect(screen.queryByTestId("fullscreen-layout")).not.toBeInTheDocument();
  });
});
