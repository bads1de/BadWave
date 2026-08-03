import { render, screen } from "@testing-library/react";
import ForYouBoard from "@/components/ForYou/ForYouBoard";

jest.mock("@/components/common/ScrollableContainer", () => "div");

jest.mock("@/components/Song/SongItem", () => "div");

jest.mock("framer-motion", () => ({
  motion: { div: "div" },
}));

jest.mock("@/hooks/player/useOnPlay", () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

describe("components/ForYou/ForYouBoard", () => {
  it("レコメンドがない場合、メッセージが表示される", () => {
    render(<ForYouBoard recommendations={[]} />);
    expect(screen.getByText(/まだ推薦曲がありません/)).toBeInTheDocument();
  });
});
