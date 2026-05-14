import { render } from "@testing-library/react";
import SongItemSkeleton from "@/components/Song/SongItemSkeleton";

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: "div",
}));

describe("components/Song/SongItemSkeleton", () => {
  it("SongItemSkeletonがレンダリングされる", () => {
    const { container } = render(<SongItemSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
