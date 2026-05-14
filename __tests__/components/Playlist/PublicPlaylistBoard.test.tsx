import { render, screen } from "@testing-library/react";
import PublicPlaylistBoard from "@/components/Playlist/PublicPlaylistBoard";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/",
}));

jest.mock("next/image", () => "img");

jest.mock("framer-motion", () => ({
  motion: { div: "div" },
}));

jest.mock("@/components/common/ScrollableContainer", () => "div");

describe("components/Playlist/PublicPlaylistBoard", () => {
  const mockPlaylists = [
    {
      id: "playlist-1",
      title: "Test Playlist",
      user_id: "user-1",
      user_name: "TestUser",
      image_path: "/images/playlist1.jpg",
      is_public: true,
      created_at: "2024-01-01",
    },
  ];

  it("playlistが表示される", () => {
    render(<PublicPlaylistBoard playlists={mockPlaylists} />);
    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
  });

  it("ユーザー名が表示される", () => {
    render(<PublicPlaylistBoard playlists={mockPlaylists} />);
    expect(screen.getByText("TestUser")).toBeInTheDocument();
  });

  it("空の配列でもエラーにならない", () => {
    const { container } = render(<PublicPlaylistBoard playlists={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
