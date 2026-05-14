import { render } from "@testing-library/react";
import ToasterProvider from "@/providers/ToasterProvider";

// react-hot-toast のモック
jest.mock("react-hot-toast", () => ({
  Toaster: "div",
}));

describe("providers/ToasterProvider", () => {
  it("ToasterProviderがレンダリングされる", () => {
    const { container } = render(<ToasterProvider />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
