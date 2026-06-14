import * as React from "react";
import { render, screen } from "@testing-library/react";
import SyncedLyrics from "@/components/Lyrics/SyncedLyrics";

const mockAudio = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
};

jest.mock("@/libs/audio/AudioEngine", () => ({
  AudioEngine: {
    getInstance: jest.fn(() => ({
      audio: mockAudio,
    })),
  },
}));

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

// Mock scrollIntoView on Element.prototype before any tests run
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

afterAll(() => {
  delete (Element.prototype as any).scrollIntoView;
});

describe("components/Lyrics/SyncedLyrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("通常テキスト表示", () => {
    it("通常のテキスト歌詞を表示する", () => {
      render(<SyncedLyrics lyrics="Line 1\nLine 2\nLine 3" />);
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });

    it("空の歌詞ではエラーにならない", () => {
      const { container } = render(<SyncedLyrics lyrics="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("単一行のテキストを表示する", () => {
      render(<SyncedLyrics lyrics="Single line lyrics" />);
      expect(screen.getByText("Single line lyrics")).toBeInTheDocument();
    });
  });

  describe("LRC形式の表示", () => {
    it("LRC形式の歌詞を正しくパースして表示する", () => {
      const lrcLyrics = `[00:00.00]First line
[00:05.00]Second line
[00:10.00]Third line`;
      render(<SyncedLyrics lyrics={lrcLyrics} />);
      expect(screen.getByText("First line")).toBeInTheDocument();
      expect(screen.getByText("Second line")).toBeInTheDocument();
      expect(screen.getByText("Third line")).toBeInTheDocument();
    });

    it("LRC形式の3桁ミリ秒を正しくパースする", () => {
      const lrcLyrics = `[00:00.000]First line
[00:05.500]Second line`;
      render(<SyncedLyrics lyrics={lrcLyrics} />);
      expect(screen.getByText("First line")).toBeInTheDocument();
      expect(screen.getByText("Second line")).toBeInTheDocument();
    });

    it("メタデータ行をスキップする", () => {
      const lrcWithMeta = `[ti:Song Title]
[ar:Artist Name]
[00:00.00]Actual lyrics`;
      render(<SyncedLyrics lyrics={lrcWithMeta} />);
      expect(screen.getByText("Actual lyrics")).toBeInTheDocument();
      expect(screen.queryByText("Song Title")).not.toBeInTheDocument();
    });

    it("空テキストのLRC行をスキップする", () => {
      const lrcWithEmpty = `[00:00.00]
[00:05.00]Second line`;
      render(<SyncedLyrics lyrics={lrcWithEmpty} />);
      expect(screen.getByText("Second line")).toBeInTheDocument();
    });

    it("END_OF_STREAMインジケーターを表示する", () => {
      const lrcLyrics = `[00:00.00]Line 1`;
      render(<SyncedLyrics lyrics={lrcLyrics} />);
      expect(screen.getByText("--- END_OF_STREAM ---")).toBeInTheDocument();
    });
  });

  describe("AudioEngineのイベント処理", () => {
    it("timeupdateイベントリスナーを登録する", () => {
      render(<SyncedLyrics lyrics="Test" />);
      expect(mockAudio.addEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
    });

    it("アンマウント時にイベントリスナーを解除する", () => {
      const { unmount } = render(<SyncedLyrics lyrics="Test" />);
      unmount();
      expect(mockAudio.removeEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
    });
  });
});
