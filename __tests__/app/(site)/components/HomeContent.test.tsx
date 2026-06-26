import { render, screen, act } from "@testing-library/react";
import HomeContent from "@/app/(site)/components/HomeContent";

const mockUseMobilePlayer = jest.fn(() => ({ isMobilePlayer: false }));

jest.mock("@/hooks/player/useMobilePlayer", () => ({
  __esModule: true,
  default: () => mockUseMobilePlayer(),
}));

jest.mock("@/components/Header/HomeHeader", () => "mock-home-header");
jest.mock("@/app/(site)/components/sections/TrendSection", () => "mock-trend-section");
jest.mock("@/app/(site)/components/sections/SpotlightSection", () => "mock-spotlight-section");
jest.mock("@/app/(site)/components/sections/LatestSection", () => "mock-latest-section");
jest.mock("@/app/(site)/components/sections/ForYouSection", () => "mock-for-you-section");
jest.mock("@/app/(site)/components/sections/PlaylistsSection", () => "mock-playlists-section");
jest.mock("@/app/(site)/components/sections/GenreSection", () => "mock-genre-section");

const defaultProps = {
  songs: [],
  spotlightData: [],
  playlists: [],
  recommendations: [],
  trendSongs: [],
};

describe("app/(site)/components/HomeContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMobilePlayer.mockReturnValue({ isMobilePlayer: false });
    window.innerWidth = 1024;
  });

  it("renders all sections", () => {
    const { container } = render(<HomeContent {...defaultProps} />);
    expect(container.querySelector("mock-trend-section")).toBeInTheDocument();
    expect(container.querySelector("mock-spotlight-section")).toBeInTheDocument();
    expect(container.querySelector("mock-latest-section")).toBeInTheDocument();
    expect(container.querySelector("mock-for-you-section")).toBeInTheDocument();
    expect(container.querySelector("mock-playlists-section")).toBeInTheDocument();
    expect(container.querySelector("mock-genre-section")).toBeInTheDocument();
  });

  it("shows HomeHeader when mobile and not in mobile player", () => {
    const { container } = render(<HomeContent {...defaultProps} />);
    expect(container.querySelector("mock-home-header")).toBeInTheDocument();
  });

  it("hides HomeHeader when in mobile player mode", () => {
    mockUseMobilePlayer.mockReturnValue({ isMobilePlayer: true });
    const { container } = render(<HomeContent {...defaultProps} />);
    expect(container.querySelector("mock-home-header")).toBeNull();
  });

  it("hides HomeHeader on desktop width after resize", () => {
    jest.useFakeTimers();
    const { container } = render(<HomeContent {...defaultProps} />);
    expect(container.querySelector("mock-home-header")).toBeInTheDocument();

    window.innerWidth = 1440;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelector("mock-home-header")).toBeNull();
    jest.useRealTimers();
  });

  it("renders system status header", () => {
    render(<HomeContent {...defaultProps} />);
    expect(screen.getByText("[ SYSTEM_READY ]")).toBeInTheDocument();
  });
});
