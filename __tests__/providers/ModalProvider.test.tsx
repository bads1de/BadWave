import { render } from "@testing-library/react";
import ModalProvider from "@/providers/ModalProvider";

jest.mock("@/components/Modals/AuthModal", () => "div");
jest.mock("@/components/Modals/UploadModal", () => "div");
jest.mock("@/components/Modals/PlaylistModal", () => "div");
jest.mock("@/components/Modals/SpotlightModal", () => "div");
jest.mock("@/components/Modals/SpotlightUploadModal", () => "div");
jest.mock("@/components/Modals/PulseUploadModal", () => "div");

describe("providers/ModalProvider", () => {
  it("ModalProviderがレンダリングされる", () => {
    const { container } = render(<ModalProvider />);
    // Provider renders modals, not children
    expect(container.firstChild).toBeInTheDocument();
  });
});
