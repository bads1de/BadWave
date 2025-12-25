import * as React from "react";
import { render, screen } from "@testing-library/react";

describe("Dummy", () => {
  it("should work", () => {
    render(<div data-testid="foo">foo</div>);
    expect(screen.getByTestId("foo")).toBeInTheDocument();
  });
});
