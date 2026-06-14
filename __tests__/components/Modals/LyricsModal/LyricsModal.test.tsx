import * as React from "react";
import { render, screen } from "@testing-library/react";
import LyricsModal from "@/components/Modals/LyricsModal/LyricsModal";

jest.mock("@/hooks/stores/useLyricsModalStore", () => ({
  __esModule: true,
  default: () => ({
    isOpen: true,
    closeModal: jest.fn(),
  }),
}));

jest.mock("@/hooks/audio/useAudioPlayer", () => ({
  __esModule: true,
  default: () => ({
    formattedCurrentTime: "1:00",
    formattedDuration: "3:00",
    currentTime: 60,
    duration: 180,
    isPlaying: false,
    handlePlay: jest.fn(),
    handleSeek: jest.fn(),
    onPlayNext: jest.fn(),
    onPlayPrevious: jest.fn(),
  }),
}));

jest.mock("@/components/Lyrics/SyncedLyrics", () => "synced-lyrics-stub");
jest.mock("@/components/Modals/LyricsModal/LyricsModalArtwork", () => "artwork-stub");
jest.mock("@/components/Modals/LyricsModal/LyricsModalControls", () => "controls-stub");

const mockSong = {
  id: "song-1",
  title: "Test Song",
  author: "Test Artist",
  lyrics: "Test lyrics content",
  image_path: "/images/test.jpg",
  song_path: "/songs/test.mp3",
  genre: "Rock",
  count: 100,
  user_id: "user-1",
  created_at: "2024-01-01",
};

describe("components/Modals/LyricsModal/LyricsModal", () => {
  it("モーダルが開いている場合は内容を表示する", () => {
    render(<LyricsModal song={mockSong} />);
    expect(document.querySelector("synced-lyrics-stub")).toBeInTheDocument();
    expect(document.querySelector("artwork-stub")).toBeInTheDocument();
    expect(document.querySelector("controls-stub")).toBeInTheDocument();
  });

  it("ヘッダーに閉じるボタンがある", () => {
    render(<LyricsModal song={mockSong} />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("キューボタンがある", () => {
    render(<LyricsModal song={mockSong} />);
    expect(screen.getByRole("button", { name: "Queue" })).toBeInTheDocument();
  });

  it("歌詞がない場合はデフォルトテキストを渡す", () => {
    render(<LyricsModal song={{ ...mockSong, lyrics: undefined }} />);
    const stub = document.querySelector("synced-lyrics-stub");
    expect(stub).toHaveAttribute("lyrics", "歌詞はありません");
  });

  it("SYNC_STATUSラベルが表示される", () => {
    render(<LyricsModal song={mockSong} />);
    expect(screen.getByText("SYNC_STATUS: ACTIVE")).toBeInTheDocument();
  });
});
