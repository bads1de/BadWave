import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SongOptionsPopover from "@/components/Song/SongOptionsPopover";
import { useUser } from "@/hooks/auth/useUser";
import useDownload from "@/hooks/data/useDownload";
import { Song } from "@/types";

// Mock dependencies
jest.mock("@/hooks/auth/useUser");
jest.mock("@/hooks/data/useDownload");
jest.mock("@/libs/utils", () => ({
  downloadFile: jest.fn(),
}));

// Mock Popover
jest.mock("@/components/ui/popover", () => {
  const React = require("react");
  return {
    Popover: ({ children }: any) => React.createElement("div", null, children),
    PopoverTrigger: ({ children }: any) => React.createElement("div", null, children),
    PopoverContent: ({ children }: any) => React.createElement("div", { "data-testid": "popover-content" }, children),
  };
});

// Mock child components
jest.mock("@/components/LikeButton", () => {
  return {
    __esModule: true,
    default: () => {
      const React = require("react");
      return React.createElement("div", null, "LikeButton");
    },
  };
});

jest.mock("@/components/Playlist/DeletePlaylistSongsBtn", () => {
  return {
    __esModule: true,
    default: () => {
      const React = require("react");
      return React.createElement("div", null, "DeleteButton");
    },
  };
});

jest.mock("@/components/Modals/DownloadPreviewModal", () => {
  return {
    __esModule: true,
    default: ({ isOpen }: any) => {
      const React = require("react");
      return isOpen ? React.createElement("div", { "data-testid": "download-modal" }, "DownloadModal") : null;
    },
  };
});

describe("components/Song/SongOptionsPopover", () => {
  const mockSong: Song = { id: "1", title: "Song" } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (useDownload as jest.Mock).mockReturnValue({ fileUrl: "url" });
  });

  it("renders like button if logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    
    render(<SongOptionsPopover song={mockSong} />);
    
    expect(screen.getByText("LikeButton")).toBeInTheDocument();
    expect(screen.getByText("ダウンロード")).toBeInTheDocument();
  });

  it("renders delete button if playlist creator", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "creator-1" } });
    
    render(
      <SongOptionsPopover 
        song={mockSong} 
        playlistId="p-1" 
        playlistUserId="creator-1" 
      />
    );
    
    expect(screen.getByText("DeleteButton")).toBeInTheDocument();
  });

  it("opens download modal on click", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    
    render(<SongOptionsPopover song={mockSong} />);
    
    // Trigger is mocked to just render children, so button is visible?
    // Wait, PopoverTrigger wraps the button.
    // PopoverContent is rendered below it in our simple mock.
    
    // Click download button inside content
    fireEvent.click(screen.getByText("ダウンロード"));
    
    expect(screen.getByTestId("download-modal")).toBeInTheDocument();
  });
});
