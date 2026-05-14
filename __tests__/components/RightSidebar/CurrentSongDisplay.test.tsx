import { render, screen } from "@testing-library/react";
import CurrentSongDisplay from "@/components/RightSidebar/CurrentSongDisplay";

jest.mock("next/image", () => "img");

jest.mock("next/link", () => "a");

jest.mock("@/components/common/ScrollingText", () => {
  const React = require("react");
  return (props: { text: string }) => React.createElement("span", null, props.text);
});

jest.mock("@/hooks/stores/useColorSchemeStore", () => ({
  __esModule: true,
  default: () => ({
    colorSchemeId: "neon",
    getColorScheme: () => ({
      id: "neon",
      name: "Neon",
      accent: "#ff00ff",
      accentFrom: "#ff00ff",
      accentTo: "#00ffff",
      text: "#ffffff",
      bg: "#0a0a0f",
      colors: { theme500: "6, 182, 212", glow: "0, 255, 255" },
    }),
    hasHydrated: true,
  }),
}));

describe("components/RightSidebar/CurrentSongDisplay", () => {
  const defaultSong = {
    id: "song-1",
    title: "Test Song",
    author: "Test Artist",
    image_path: "/images/test.jpg",
    song_path: "/songs/test.mp3",
    genre: "Electronic",
    duration: 180,
    count: 100,
    like_count: 50,
    created_at: "2024-01-01",
  };

  it("曲のタイトルが表示される", () => {
    render(<CurrentSongDisplay song={defaultSong} />);
    expect(screen.getByText("Test Song")).toBeInTheDocument();
  });

  it("アーティスト名が表示される", () => {
    render(<CurrentSongDisplay song={defaultSong} />);
    expect(screen.getByText("// AUTH: Test Artist")).toBeInTheDocument();
  });

  it("再生回数が表示される", () => {
    render(<CurrentSongDisplay song={defaultSong} />);
    expect(screen.getByText("LOG: 100")).toBeInTheDocument();
  });

  it("いいね数が表示される", () => {
    render(<CurrentSongDisplay song={defaultSong} />);
    expect(screen.getByText("AFF: 50")).toBeInTheDocument();
  });
});
