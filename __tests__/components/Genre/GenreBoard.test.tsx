import { render, screen } from "@testing-library/react";
import GenreBoard from "@/components/Genre/GenreBoard";

jest.mock("@/components/common/ScrollableContainer", () => "div");
jest.mock("@/components/Genre/GenreCard", () => "div");

describe("components/Genre/GenreBoard", () => {
  it("GenreBoardがレンダリングされる", () => {
    const { container } = render(<GenreBoard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("ジャンルカードが表示される", () => {
    const { container } = render(<GenreBoard />);
    const cards = container.querySelectorAll("div");
    expect(cards.length).toBeGreaterThan(0);
  });
});
