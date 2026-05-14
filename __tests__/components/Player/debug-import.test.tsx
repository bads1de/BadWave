let MobilePlayer: any = undefined;
try {
  const mod = require("@/components/Player/MobilePlayer");
  console.log("Module keys:", Object.keys(mod));
  console.log("Has default:", "default" in mod);
  MobilePlayer = mod.default;
  console.log("MobilePlayer type:", typeof MobilePlayer);
} catch (e: any) {
  console.log("Import error:", e.message);
  console.log("Stack:", e.stack?.split("\n").slice(0, 5).join("\n"));
}

describe("debug", () => {
  it("check", () => {
    expect(true).toBe(true);
  });
});
