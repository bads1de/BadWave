import { render } from "@testing-library/react";
import Player from "@/components/Player/Player";

const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("@/hooks/data/useGetSongById", () => ({
  __esModule: true,
  default: () => ({ song: null, isLoading: false }),
}));

jest.mock("@/hooks/player/usePlayer", () => ({
  __esModule: true,
  default: () => ({ activeId: null }),
}));

jest.mock("@/hooks/player/useMobilePlayer", () => ({
  __esModule: true,
  default: () => ({ isMobilePlayer: false }),
}));

jest.mock("@/hooks/audio/useAudioControl", () => ({
  __esModule: true,
  default: () => ({ stopMainPlayer: jest.fn() }),
}));

jest.mock("@/components/Mobile/MobileTabs", () => "div");
jest.mock("@/components/Player/PlayerContent", () => "div");
// Player imports from ../Modals/LyricsModal/LyricsModal
jest.mock("@/components/Modals/LyricsModal/LyricsModal", () => "div");
jest.mock("next/image", () => "img");

describe("components/Player/Player", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("Playerがレンダリングされる", () => {
    const { container } = render(<Player playlists={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("pulseページではレンダリングされない", () => {
    mockUsePathname.mockReturnValue("/pulse");
    const { container } = render(<Player playlists={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
