import {
  colorSchemes,
  getColorSchemeById,
  DEFAULT_COLOR_SCHEME_ID,
} from "@/constants/colorSchemes";

describe("constants/colorSchemes", () => {
  describe("colorSchemes", () => {
    it("should have at least one color scheme", () => {
      expect(colorSchemes.length).toBeGreaterThan(0);
    });

    it("should have unique ids", () => {
      const ids = colorSchemes.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("each scheme should have all required fields", () => {
      for (const scheme of colorSchemes) {
        expect(scheme.id).toBeDefined();
        expect(scheme.name).toBeDefined();
        expect(scheme.description).toBeDefined();
        expect(scheme.previewGradient).toMatch(/^linear-gradient/);
        expect(scheme.colors.accentFrom).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(scheme.colors.accentVia).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(scheme.colors.accentTo).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(scheme.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(scheme.colors.theme300).toMatch(/^\d+/);
        expect(scheme.colors.theme400).toMatch(/^\d+/);
        expect(scheme.colors.theme500).toMatch(/^\d+/);
        expect(scheme.colors.theme600).toMatch(/^\d+/);
        expect(scheme.colors.theme900).toMatch(/^\d+/);
      }
    });
  });

  describe("DEFAULT_COLOR_SCHEME_ID", () => {
    it("should be violet", () => {
      expect(DEFAULT_COLOR_SCHEME_ID).toBe("violet");
    });
  });

  describe("getColorSchemeById", () => {
    it("should return the correct scheme for a valid id", () => {
      const scheme = getColorSchemeById("emerald");
      expect(scheme.id).toBe("emerald");
      expect(scheme.name).toBe("エメラルド");
    });

    it("should return the default scheme for an invalid id", () => {
      const scheme = getColorSchemeById("non-existent");
      expect(scheme.id).toBe(DEFAULT_COLOR_SCHEME_ID);
    });

    it("should return the correct scheme for each valid id", () => {
      for (const expected of colorSchemes) {
        const result = getColorSchemeById(expected.id);
        expect(result.id).toBe(expected.id);
      }
    });
  });
});
