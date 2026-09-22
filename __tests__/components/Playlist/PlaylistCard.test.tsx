import { render, screen, fireEvent } from "@testing-library/react";
import PlaylistCard from "@/components/Playlist/PlaylistCard";
import { Playlist } from "@/types";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn() }),
}));

describe("components/Playlist/PlaylistCard", () => {
  const playlist: Playlist = {
    id: "playlist-1",
    user_id: "user-1",
    title: "My Playlist",
    image_path: "playlist.jpg",
    is_public: false,
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCard = (props: Record<string, unknown> = {}) =>
    render(
      <PlaylistCard
        playlist={playlist}
        href="/playlists/playlist-1"
        {...props}
      >
        <h3>{playlist.title}</h3>
      </PlaylistCard>
    );

  it("アートワークと差し込んだ情報ブロックを表示すること", () => {
    renderCard();

    expect(screen.getByAltText("My Playlist")).toHaveAttribute(
      "src",
      "playlist.jpg"
    );
    expect(screen.getByText("My Playlist")).toBeInTheDocument();
  });

  it("画像がない場合はデフォルト画像を表示すること", () => {
    render(
      <PlaylistCard
        playlist={{ ...playlist, image_path: undefined }}
        href="/playlists/playlist-1"
      />
    );

    expect(screen.getByAltText("My Playlist")).toHaveAttribute(
      "src",
      "/images/playlist.png"
    );
  });

  it("クリックするとhrefへ遷移すること", () => {
    const { container } = renderCard({
      href: "/playlists/playlist-1?title=My%20Playlist",
    });

    fireEvent.click(container.firstElementChild!);

    expect(mockPush).toHaveBeenCalledWith(
      "/playlists/playlist-1?title=My%20Playlist"
    );
  });

  it("header / imageOverlay / childrenを差し込めること", () => {
    renderCard({
      header: <span>HEADER_SLOT</span>,
      imageOverlay: <span>OVERLAY_SLOT</span>,
    });

    expect(screen.getByText("HEADER_SLOT")).toBeInTheDocument();
    expect(screen.getByText("OVERLAY_SLOT")).toBeInTheDocument();
    expect(screen.getByText("My Playlist")).toBeInTheDocument();
  });

  it("追加クラスで既定値を上書きできること", () => {
    const { container } = renderCard({
      className: "min-w-[200px]",
      cardClassName: "p-0 rounded-xl",
      artworkClassName: "mb-0 border-0",
      sizes: "200px",
    });

    const card = container.querySelector(".rounded-xl")!;
    expect(card).not.toHaveClass("p-4");
    expect(container.firstElementChild).toHaveClass("min-w-[200px]");
    expect(container.querySelector(".aspect-square")).not.toHaveClass("mb-4");
    expect(screen.getByAltText("My Playlist")).toHaveAttribute("sizes", "200px");
  });
});
