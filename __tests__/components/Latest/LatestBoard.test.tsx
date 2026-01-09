import { render, screen, fireEvent } from "@testing-library/react";
import LatestBoard from "@/components/Latest/LatestBoard";
import useOnPlay from "@/hooks/player/useOnPlay";
import { Song } from "@/types";

// Mock hooks
jest.mock("@/hooks/player/useOnPlay");
jest.mock("@/hooks/player/usePlayer", () => ({
  __esModule: true,
  default: () => ({ setId: jest.fn() }),
}));

// Mock framer-motion
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: {
      div: (props: any) => {
        const { children } = props;
        const otherProps = Object.assign({}, props);
        delete otherProps.children;
        // Avoid passing variants etc to DOM
        const divProps = { className: props.className, "data-testid": "motion-div" };
        return React.createElement("div", divProps, children);
      },
    },
  };
});

// Mock child components
jest.mock("@/components/Song/SongItem", () => {
  return {
    __esModule: true,
    default: ({ data, onClick }: any) => {
      const React = require("react");
      return React.createElement("div", {
        "data-testid": "song-item",
        onClick: () => onClick(data.id),
      }, data.title);
    },
  };
});

jest.mock("@/components/common/ScrollableContainer", () => {
  return {
    __esModule: true,
    default: ({ children }: any) => {
      const React = require("react");
      return React.createElement("div", { "data-testid": "scrollable-container" }, children);
    },
  };
});

describe("components/Latest/LatestBoard", () => {
  const mockOnPlay = jest.fn();
  const mockSongs: Song[] = [
    { id: "1", title: "Latest Song 1" } as any,
    { id: "2", title: "Latest Song 2" } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnPlay as jest.Mock).mockReturnValue(mockOnPlay);
  });

  it("renders empty message when no songs", () => {
    render(<LatestBoard songs={[]} />);
    expect(screen.getByText("曲が見つかりませんでした")).toBeInTheDocument();
  });

  it("renders songs list", () => {
    render(<LatestBoard songs={mockSongs} />);
    expect(screen.getByText("Latest Song 1")).toBeInTheDocument();
    expect(screen.getByText("Latest Song 2")).toBeInTheDocument();
  });

  it("plays song on click", () => {
    render(<LatestBoard songs={mockSongs} />);
    
    const songItem = screen.getByText("Latest Song 1");
    fireEvent.click(songItem);

    expect(mockOnPlay).toHaveBeenCalledWith("1");
  });
});
