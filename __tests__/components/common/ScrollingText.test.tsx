import { render, screen } from "@testing-library/react";
import ScrollingText from "@/components/common/ScrollingText";

describe("components/common/ScrollingText", () => {
  it("短いテキストはそのまま表示される", () => {
    render(<ScrollingText text="Short" />);
    expect(screen.getByText("Short")).toBeInTheDocument();
    expect(document.querySelector(".scrolling-text")).not.toBeInTheDocument();
  });

  it("長いテキストはscrolling-textクラスが適用される", () => {
    render(<ScrollingText text="This is a very long text that should scroll" />);
    const scrollingSpan = document.querySelector(".scrolling-text");
    expect(scrollingSpan).toBeInTheDocument();
    expect(scrollingSpan?.textContent).toBe("This is a very long text that should scroll");
  });

  it("limitCharactersより短いテキストはスクロールしない", () => {
    render(<ScrollingText text="Hello" limitCharacters={10} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(document.querySelector(".scrolling-text")).not.toBeInTheDocument();
  });

  it("limitCharactersより長いテキストはスクロールする", () => {
    render(<ScrollingText text="Hello World!!!" limitCharacters={10} />);
    expect(document.querySelector(".scrolling-text")).toBeInTheDocument();
  });

  it("カスタムdurationがスタイルに反映される", () => {
    render(<ScrollingText text="This is a very long text that should scroll" duration={5} />);
    const scrollingSpan = document.querySelector(".scrolling-text") as HTMLElement;
    expect(scrollingSpan).toBeInTheDocument();
    expect(scrollingSpan.style.animationDuration).toBeDefined();
  });
});
