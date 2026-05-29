import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MobilePlayerContent from "@/components/Mobile/MobilePlayerContent";
import React from "react";

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

jest.mock("framer-motion", () => ({
  motion: { div: "div", span: "span" },
  AnimatePresence: ({ children }: any) => children,
}));

jest.mock("next/image", () => "img");

jest.mock("@/components/Player/SeekBar", () => "div");
jest.mock("@/components/Player/CommonControls", () => "div");
jest.mock("@/components/Player/PlaybackSpeedButton", () => "div");
jest.mock("@/components/Player/EqualizerButton", () => "div");
jest.mock("@/components/LikeButton", () => "div");

jest.mock("@/components/common/ScrollingText", () => {
  const React = require("react");
  return (props: { text: string }) => React.createElement("span", null, props.text);
});

jest.mock("@/components/Mobile/LyricsDrawer", () => "div");

jest.mock("@/hooks/auth/useUser", () => ({
  useUser: () => ({ user: null, isLoading: false }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

jest.mock("@/libs/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) }),
    auth: { getSession: () => Promise.resolve({ data: { session: null }, error: null }) },
  }),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("components/Mobile/MobilePlayerContent", () => {
  const defaultProps = {
    song: {
      id: "song-1",
      title: "Test Song",
      author: "Test Artist",
      image_path: "/images/test.jpg",
      song_path: "/songs/test.mp3",
      genre: "Electronic",
      duration: 180,
      count: "100",
      like_count: "50",
      created_at: "2024-01-01",
      user_id: "user-1",
    },
    songUrl: "/songs/test.mp3",
    imageUrl: "/images/test.jpg",
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    formattedCurrentTime: "0:00",
    formattedDuration: "3:00",
    isShuffling: false,
    isRepeating: false,
    playlists: [],
    handlePlay: jest.fn(),
    handleSeek: jest.fn(),
    toggleMobilePlayer: jest.fn(),
    toggleShuffle: jest.fn(),
    toggleRepeat: jest.fn(),
    onPlayNext: jest.fn(),
    onPlayPrevious: jest.fn(),
  };

  it("MobilePlayerContentがレンダリングされる", () => {
    const { container } = render(<MobilePlayerContent {...defaultProps} />, { wrapper: Wrapper });
    expect(container.firstChild).toBeInTheDocument();
  });

  it("曲名が表示される", () => {
    render(<MobilePlayerContent {...defaultProps} />, { wrapper: Wrapper });
    expect(screen.getByText("Test Song")).toBeInTheDocument();
  });

  it("アーティスト名が表示される", () => {
    render(<MobilePlayerContent {...defaultProps} />, { wrapper: Wrapper });
    // Artist is displayed with prefix: // AUTH: Test Artist
    expect(screen.getByText("// AUTH: Test Artist")).toBeInTheDocument();
  });
});
