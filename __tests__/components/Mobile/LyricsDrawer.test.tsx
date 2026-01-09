import { render, screen, fireEvent } from "@testing-library/react";
import LyricsDrawer from "@/components/Mobile/LyricsDrawer";

// Mock framer-motion to render children directly without animation complexity
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
    motion: {
      div: (props: any) => {
        const { children } = props;
        const otherProps = Object.assign({}, props);
        delete otherProps.children;
        const elementProps = Object.assign({ "data-testid": "motion-div" }, otherProps);
        return React.createElement("div", elementProps, children);
      },
    },
  };
});

describe("components/Mobile/LyricsDrawer", () => {
  const mockToggleLyrics = jest.fn();

  it("renders nothing when showLyrics is false", () => {
    render(
      <LyricsDrawer 
        showLyrics={false} 
        toggleLyrics={mockToggleLyrics} 
        lyrics="La la la" 
      />
    );
    expect(screen.queryByText("歌詞")).not.toBeInTheDocument();
  });

  it("renders lyrics when showLyrics is true", () => {
    render(
      <LyricsDrawer 
        showLyrics={true} 
        toggleLyrics={mockToggleLyrics} 
        lyrics="Test Lyrics content" 
      />
    );
    expect(screen.getByText("歌詞")).toBeInTheDocument();
    expect(screen.getByText("Test Lyrics content")).toBeInTheDocument();
  });

  it("calls toggleLyrics when close button is clicked", () => {
    render(
      <LyricsDrawer 
        showLyrics={true} 
        toggleLyrics={mockToggleLyrics} 
        lyrics="Lyrics" 
      />
    );
    
    // The close button is the one with BsChevronDown icon.
    // Since we don't have aria-label on that button in the component code provided,
    // we can find it by looking for the button inside the motion div.
    // Or we can rely on the fact it's a button.
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons[0]; // Assuming it's the first/only button
    
    fireEvent.click(closeButton);
    expect(mockToggleLyrics).toHaveBeenCalled();
  });
});
