import { render, screen } from "@testing-library/react";
import Modal from "@/components/Modals/Modal";

// Radix Dialog のモック - JSXを使わない
jest.mock("@radix-ui/react-dialog", () => ({
  Root: "div",
  Portal: "div",
  Overlay: "div",
  Content: "div",
  Title: "div",
  Description: "div",
  Close: "button",
}));

describe("components/Modals/Modal", () => {
  it("isOpenがtrueの場合、モーダルが表示される", () => {
    render(
      <Modal isOpen={true} onChange={jest.fn()} title="Test Modal" description="Test modal description">
        <div data-testid="modal-content">Content</div>
      </Modal>
    );
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("タイトルが表示される", () => {
    render(
      <Modal isOpen={true} onChange={jest.fn()} title="Test Title" description="Test title description">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("説明文が表示される", () => {
    render(
      <Modal isOpen={true} onChange={jest.fn()} title="Title" description="Test Description">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("子要素がレンダリングされる", () => {
    render(
      <Modal isOpen={true} onChange={jest.fn()} title="Test Modal" description="Test modal description">
        <button data-testid="child-btn">Click me</button>
      </Modal>
    );
    expect(screen.getByTestId("child-btn")).toBeInTheDocument();
  });
});
