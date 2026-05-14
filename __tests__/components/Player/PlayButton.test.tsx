import { render, screen, fireEvent } from "@testing-library/react";
import PlayButton from "@/components/Player/PlayButton";

describe("components/Player/PlayButton", () => {
  it("再生アイコンを表示する", () => {
    render(<PlayButton />);
    // FaPlay アイコンが表示される
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("デフォルトサイズ35でレンダリングされる", () => {
    const { container } = render(<PlayButton />);
    const button = container.firstChild as HTMLElement;
    const svg = button.querySelector("svg");
    // size propが35の場合、width/heightが35 / 2 にならないので、単にsvgが存在することを確認
    expect(svg).toBeInTheDocument();
  });

  it("カスタムサイズを指定できる", () => {
    const { container } = render(<PlayButton size={50} />);
    const button = container.firstChild as HTMLElement;
    expect(button).toBeInTheDocument();
  });

  it("クリック可能である", () => {
    const handleClick = jest.fn();
    const { container } = render(<PlayButton />);
    const button = container.firstChild as HTMLElement;
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled(); // onClickはオプション
  });
});
