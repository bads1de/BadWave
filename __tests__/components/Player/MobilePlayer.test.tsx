import MobilePlayer from "@/components/Player/MobilePlayer";

describe("components/Player/MobilePlayer", () => {
  it("MobilePlayerが正しくエクスポートされている", () => {
    // Verify the component is properly exported as a React.memo component
    expect(MobilePlayer).toBeDefined();
    expect(MobilePlayer.displayName).toBe("MobilePlayer");
    // React.memo components have the inner component function in the type property
    expect(typeof MobilePlayer.type).toBe("function");
  });
});
