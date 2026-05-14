import { render, screen } from "@testing-library/react";
import SyncedLyrics from "@/components/Lyrics/SyncedLyrics";

jest.mock("@/libs/audio/AudioEngine", () => {
  const mockAudio = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    currentTime: 0,
  };
  return {
    AudioEngine: {
      getInstance: jest.fn(() => ({
        audio: mockAudio,
      })),
    },
  };
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

describe("components/Lyrics/SyncedLyrics", () => {
  it("通常のテキスト歌詞を表示する", () => {
    render(<SyncedLyrics lyrics="Line 1\nLine 2\nLine 3" />);
    // Text is rendered in a single <p> with whitespace-pre-wrap
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
    expect(screen.getByText(/Line 3/)).toBeInTheDocument();
  });

  it("undefinedの歌詞ではエラーにならない", () => {
    const { container } = render(<SyncedLyrics lyrics={undefined} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
