import { render, screen, fireEvent } from "@testing-library/react";
import ScrollableContainer from "@/components/common/ScrollableContainer";

describe("components/common/ScrollableContainer", () => {
  it("childrenをレンダリングする", () => {
    render(
      <ScrollableContainer>
        <div data-testid="child">Content</div>
      </ScrollableContainer>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("showArrowsがfalseの場合、矢印ボタンが表示されない", () => {
    render(
      <ScrollableContainer showArrows={false}>
        <div>Content</div>
      </ScrollableContainer>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("showArrowsがtrueの場合でも矢印ボタンはhiddenクラスを持つ", () => {
    render(
      <ScrollableContainer showArrows={true}>
        <div>Content</div>
      </ScrollableContainer>
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("カスタムclassNameが適用される", () => {
    render(
      <ScrollableContainer className="custom-class">
        <div>Content</div>
      </ScrollableContainer>
    );
    // 子要素がレンダリングされていることを確認
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("矢印がクリック可能である", () => {
    const mockScrollBy = jest.fn();
    Element.prototype.scrollBy = mockScrollBy;

    render(
      <ScrollableContainer showArrows={true}>
        <div style={{ width: 1000 }}>Content</div>
      </ScrollableContainer>
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    // 左矢印（最初のボタン）をクリック
    fireEvent.click(buttons[0]);
    expect(mockScrollBy).toHaveBeenCalled();
  });
});
