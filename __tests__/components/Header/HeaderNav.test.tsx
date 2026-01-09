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
    expect(screen.getByText("曲")).toBeInTheDocument();
    expect(screen.getByText("プレイリスト")).toBeInTheDocument();
  });

  it("initializes active tab from URL", () => {
    const params = new URLSearchParams();
    params.set("tab", "playlists");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    render(<HeaderNav />);
    
    const playlistBtn = screen.getByText("プレイリスト").closest("button");
    const songsBtn = screen.getByText("曲").closest("button");

    expect(playlistBtn).toHaveClass("bg-theme-600/90");
    expect(songsBtn).not.toHaveClass("bg-theme-600/90");
  });

  it("navigates on tab click", () => {
    render(<HeaderNav />);
    
    const playlistBtn = screen.getByText("プレイリスト");
    fireEvent.click(playlistBtn);

    expect(mockPush).toHaveBeenCalledWith("/search?tab=playlists");
  });

  it("preserves existing query params", () => {
    const params = new URLSearchParams();
    params.set("title", "search query");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    render(<HeaderNav />);
    
    const playlistBtn = screen.getByText("プレイリスト");
    fireEvent.click(playlistBtn);

    // Should include both title and new tab param
    // The order depends on how URLSearchParams stringifies, 
    // but our mock implementation is simple.
    // The mock puts tab last because we spread ...currentQuery then tab: value.
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("title=search+query"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("tab=playlists"));
  });
});
