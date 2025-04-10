import * as React from "react";
import { render, screen } from "@testing-library/react";
import SectionSkeleton from "@/app/(site)/components/sections/SectionSkeleton";

describe("SectionSkeleton", () => {
  it("renders default skeleton with title and description", () => {
    render(<SectionSkeleton />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Please wait")).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    render(
      <SectionSkeleton title="Custom Title" description="Custom Description" />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
  });

  it("renders trend section skeleton when type is trend", () => {
    render(<SectionSkeleton type="trend" />);

    // トレンドセクション特有の要素をチェック
    const periodSelector = screen.getByTestId("trend-period-selector-skeleton");
    expect(periodSelector).toBeInTheDocument();

    // トレンドカードが複数あることを確認
    const trendCards = screen.getAllByTestId("trend-card-skeleton");
    expect(trendCards.length).toBeGreaterThan(0);
  });

  it("renders spotlight section skeleton when type is spotlight", () => {
    render(<SectionSkeleton type="spotlight" />);

    // スポットライトカードが複数あることを確認
    const spotlightCards = screen.getAllByTestId("spotlight-card-skeleton");
    expect(spotlightCards.length).toBeGreaterThan(0);
  });

  it("renders latest section skeleton when type is latest", () => {
    render(<SectionSkeleton type="latest" />);

    // 最新曲カードが複数あることを確認
    const latestCards = screen.getAllByTestId("song-card-skeleton");
    expect(latestCards.length).toBeGreaterThan(0);
  });

  it("renders for you section skeleton when type is forYou", () => {
    render(<SectionSkeleton type="forYou" />);

    // おすすめカードが複数あることを確認
    const forYouCards = screen.getAllByTestId("song-card-skeleton");
    expect(forYouCards.length).toBeGreaterThan(0);
  });

  it("renders playlists section skeleton when type is playlists", () => {
    render(<SectionSkeleton type="playlists" />);

    // プレイリストカードが複数あることを確認
    const playlistCards = screen.getAllByTestId("playlist-card-skeleton");
    expect(playlistCards.length).toBeGreaterThan(0);
  });

  it("renders genre section skeleton when type is genre", () => {
    render(<SectionSkeleton type="genre" />);

    // ジャンルカードが複数あることを確認
    const genreCards = screen.getAllByTestId("genre-card-skeleton");
    expect(genreCards.length).toBeGreaterThan(0);
  });
});
