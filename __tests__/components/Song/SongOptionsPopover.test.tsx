import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import SongOptionsPopover from "@/components/Song/SongOptionsPopover";
import { useUser } from "@/hooks/auth/useUser";
import useDownload from "@/hooks/data/useDownload";
import { Song } from "@/types";

// Mock dependencies
jest.mock("@/hooks/auth/useUser");
jest.mock("@/hooks/data/useDownload");
jest.mock("@/libs/utils/utils", () => ({
  downloadFile: jest.fn(),
}));

// Mock Popover
jest.mock("@/components/ui/popover", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    Popover: ({ children }: { children: ReactNode }) => React.createElement("div", null, children),
    PopoverTrigger: ({ children }: { children: ReactNode }) => React.createElement("div", null, children),
    PopoverContent: ({ children }: { children: ReactNode }) => React.createElement("div", { "data-testid": "popover-content" }, children),
  };
});

// Mock child components
jest.mock("@/components/LikeButton", () => {
  return {
    __esModule: true,
    default: () => {
      const React = jest.requireActual<typeof import("react")>("react");
      return React.createElement("div", null, "LikeButton");
    },
  };
});

jest.mock("@/components/Playlist/DeletePlaylistSongsBtn", () => {
  return {
    __esModule: true,
    default: () => {
      const React = jest.requireActual<typeof import("react")>("react");
      return React.createElement("div", null, "DeleteButton");
    },
  };
});

jest.mock("@/components/Modals/DownloadPreviewModal", () => {
  return {
    __esModule: true,
    default: ({ isOpen }: { isOpen: boolean }) => {
      const React = jest.requireActual<typeof import("react")>("react");
      return isOpen ? React.createElement("div", { "data-testid": "download-modal" }, "DownloadModal") : null;
    },
  };
});

describe("components/Song/SongOptionsPopover", () => {
  const mockSong: Song = {
    id: "1",
    user_id: "user-1",
    author: "Author",
    title: "Song",
    song_path: "song.mp3",
    image_path: "img.jpg",
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDownload as jest.Mock).mockReturnValue({ fileUrl: "url" });
  });

  it("renders like button if logged in", () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
    
    render(<SongOptionsPopover song={mockSong} />);
    
    expect(screen.getByText("LikeButton")).toBeInTheDocument();
    expect(screen.getByText("// EXTRACT_ASSET")).toBeInTheDocument();
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
    fireEvent.click(screen.getByText("// EXTRACT_ASSET"));
    
    expect(screen.getByTestId("download-modal")).toBeInTheDocument();
  });
});
