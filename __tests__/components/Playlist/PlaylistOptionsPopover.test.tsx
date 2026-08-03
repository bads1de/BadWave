import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import PlaylistOptionsPopover from "@/components/Playlist/PlaylistOptionsPopover";
import { createClient } from "@/libs/supabase/client";

// Mock dependencies
jest.mock("@/libs/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: { id: "user-1" } }),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock @tanstack/react-query
// We mock useMutation to return a mock mutate function
const mockMutate = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Mock Popover components from shadcn/ui
// Since they rely on Radix UI, simple mocking is safer for unit tests
jest.mock("@/components/ui/popover", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    Popover: ({ children }: { children: ReactNode }) => React.createElement("div", { "data-testid": "popover" }, children),
    PopoverTrigger: ({ children }: { children: ReactNode }) => React.createElement("div", { "data-testid": "popover-trigger" }, children),
    PopoverContent: ({ children }: { children: ReactNode }) => React.createElement("div", { "data-testid": "popover-content" }, children),
  };
});

describe("components/Playlist/PlaylistOptionsPopover", () => {
  let mockSupabase: { from: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      from: jest.fn(() => ({
        update: jest.fn(() => ({ eq: jest.fn(() => ({ eq: jest.fn() })) })),
        delete: jest.fn(() => ({ eq: jest.fn(() => ({ eq: jest.fn() })) })),
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("renders trigger button", () => {
    render(
      <PlaylistOptionsPopover 
        playlistId="1" 
        currentTitle="My Playlist" 
        isPublic={false} 
      />
    );
    expect(screen.getByLabelText("More Options")).toBeInTheDocument();
  });

  it("shows options when content is rendered", () => {
    // Since we mocked Popover to always render children, content is visible
    render(
      <PlaylistOptionsPopover 
        playlistId="1" 
        currentTitle="My Playlist" 
        isPublic={false} 
      />
    );
    
    expect(screen.getByText("// MODIFY_NAME")).toBeInTheDocument();
    expect(screen.getByText("// STATUS: PUBLIC")).toBeInTheDocument();
    expect(screen.getByText("// TERMINATE_DATA")).toBeInTheDocument();
  });

  it("switches to edit mode", () => {
    render(
      <PlaylistOptionsPopover 
        playlistId="1" 
        currentTitle="My Playlist" 
        isPublic={false} 
      />
    );

    fireEvent.click(screen.getByText("// MODIFY_NAME"));
    
    expect(screen.getByPlaceholderText("NEW_IDENTIFIER")).toHaveValue("My Playlist");
    expect(screen.getByText("[ COMMIT ]")).toBeInTheDocument();
  });

  it("triggers delete mutation", () => {
    render(
      <PlaylistOptionsPopover 
        playlistId="1" 
        currentTitle="My Playlist" 
        isPublic={false} 
      />
    );

    fireEvent.click(screen.getByText("// TERMINATE_DATA"));
    expect(mockMutate).toHaveBeenCalled();
  });
});
