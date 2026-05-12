import { render, screen, fireEvent } from "@testing-library/react";
import HeaderNav from "@/components/Header/HeaderNav";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock query-string
jest.mock("query-string", () => ({
  stringifyUrl: jest.fn(({ url, query }) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }),
}));

describe("components/Header/HeaderNav", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (usePathname as jest.Mock).mockReturnValue("/search");
    
    const params = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(params);
  });

  it("renders buttons", () => {
    render(<HeaderNav />);
    expect(screen.getByText("[ AUDIO_NODES ]")).toBeInTheDocument();
    expect(screen.getByText("[ COLLECTION_DATA ]")).toBeInTheDocument();
  });

  it("initializes active tab from URL", () => {
    const params = new URLSearchParams();
    params.set("tab", "playlists");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    render(<HeaderNav />);
    
    const playlistBtn = screen.getByText("[ COLLECTION_DATA ]").closest("button");
    const songsBtn = screen.getByText("[ AUDIO_NODES ]").closest("button");

    expect(playlistBtn).toHaveClass("text-white");
    expect(songsBtn).not.toHaveClass("text-white");
  });

  it("navigates on tab click", () => {
    render(<HeaderNav />);
    
    const playlistBtn = screen.getByText("[ COLLECTION_DATA ]");
    fireEvent.click(playlistBtn);

    expect(mockPush).toHaveBeenCalledWith("/search?tab=playlists");
  });

  it("preserves existing query params", () => {
    const params = new URLSearchParams();
    params.set("title", "search query");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    render(<HeaderNav />);
    
    const playlistBtn = screen.getByText("[ COLLECTION_DATA ]");
    fireEvent.click(playlistBtn);

    // Should include both title and new tab param
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("title=search+query"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("tab=playlists"));
  });
});
