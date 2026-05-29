import MobilePlayer from "@/components/Player/MobilePlayer";

describe("components/Player/MobilePlayer", () => {
  it("MobilePlayerが正しくエクスポートされている", () => {
    // Verify the component is properly exported as a React.memo component
    expect(MobilePlayer).toBeDefined();
    expect(MobilePlayer.displayName).toBe("MobilePlayer");
  });
});
