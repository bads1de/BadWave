import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

// メモ化コンポーネントのテスト用のモックコンポーネント
interface MockProps {
  foo: string;
}

const MockComponent = jest.fn((props: MockProps) => (
  <div>Mock Component: {props.foo}</div>
));

const MemoizedComponent = React.memo(MockComponent);

describe("メモ化テスト", () => {
  beforeEach(() => {
    MockComponent.mockClear();
  });

  it("メモ化されたコンポーネントはプロップが変更されない場合に再レンダリングされない", () => {
    const { rerender } = render(<MemoizedComponent foo="bar" />);
    expect(MockComponent).toHaveBeenCalledTimes(1);

    // 同じプロップで再レンダリング
    rerender(<MemoizedComponent foo="bar" />);
    expect(MockComponent).toHaveBeenCalledTimes(1);
  });

  it("メモ化されたコンポーネントはプロップが変更された場合に再レンダリングされる", () => {
    const { rerender } = render(<MemoizedComponent foo="bar" />);
    expect(MockComponent).toHaveBeenCalledTimes(1);

    // 異なるプロップで再レンダリング
    rerender(<MemoizedComponent foo="baz" />);
    expect(MockComponent).toHaveBeenCalledTimes(2);
  });
});
