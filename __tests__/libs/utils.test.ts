import {
  cn,
  getRandomColor,
  splitTags,
  sanitizeTitle,
  generateRandomString,
  formatTime,
  downloadFile,
} from "@/libs/utils";

describe("libs/utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("px-2", "py-2")).toBe("px-2 py-2");
    });

    it("should handle conditional classes", () => {
      expect(cn("px-2", true && "py-2", false && "m-2")).toBe("px-2 py-2");
    });

    it("should merge tailwind classes using tailwind-merge", () => {
      expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4");
    });
  });

  describe("getRandomColor", () => {
    it("should return a valid color string", () => {
      const color = getRandomColor();
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe("splitTags", () => {
    it("should split comma-separated tags", () => {
      expect(splitTags("tag1, tag2,tag3")).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should return empty array for empty string or undefined", () => {
      expect(splitTags("")).toEqual([]);
      expect(splitTags(undefined)).toEqual([]);
    });

    it("should filter out empty items", () => {
      expect(splitTags("tag1,, tag2, ")).toEqual(["tag1", "tag2"]);
    });
  });

  describe("sanitizeTitle", () => {
    it("should return valid title as is", () => {
      expect(sanitizeTitle("valid-Title_123")).toBe("valid-Title_123");
    });

    it("should generate random string for invalid characters", () => {
      const invalidTitle = "Invalid Title!"; // space and ! are not allowed
      const result = sanitizeTitle(invalidTitle);
      expect(result).not.toBe(invalidTitle);
      expect(result).toMatch(/^[a-zA-Z0-9-_]{10}$/);
    });
  });

  describe("generateRandomString", () => {
    it("should generate string of specified length", () => {
      expect(generateRandomString(10)).toHaveLength(10);
      expect(generateRandomString(5)).toHaveLength(5);
    });

    it("should contain allowed characters only", () => {
      const str = generateRandomString(100);
      expect(str).toMatch(/^[a-zA-Z0-9-_]+$/);
    });
  });

  describe("formatTime", () => {
    it("should format seconds to mm:ss", () => {
      expect(formatTime(0)).toBe("0:00");
      expect(formatTime(9)).toBe("0:09");
      expect(formatTime(60)).toBe("1:00");
      expect(formatTime(65)).toBe("1:05");
      expect(formatTime(3599)).toBe("59:59");
    });
  });

  describe("downloadFile", () => {
    let originalFetch: typeof global.fetch;
    let originalURL: typeof window.URL;

    beforeEach(() => {
      originalFetch = global.fetch;
      originalURL = window.URL;

      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(["content"])),
        } as Response)
      );

      // Mock URL.createObjectURL and revokeObjectURL
      window.URL.createObjectURL = jest.fn(() => "blob:url");
      window.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement and body methods
      const mockAnchor = {
        href: "",
        download: "",
        click: jest.fn(),
      } as unknown as HTMLAnchorElement;

      jest.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "a") return mockAnchor;
        return document.createElement(tagName);
      });

      jest.spyOn(document.body, "appendChild").mockImplementation(() => mockAnchor);
      jest.spyOn(document.body, "removeChild").mockImplementation(() => mockAnchor);
    });

    afterEach(() => {
      global.fetch = originalFetch;
      window.URL = originalURL;
      jest.restoreAllMocks();
    });

    it("should download file successfully", async () => {
      await downloadFile("https://example.com/file.mp3", "test.mp3");

      expect(global.fetch).toHaveBeenCalledWith("https://example.com/file.mp3", {
        mode: "cors",
      });
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      // Verify anchor click
      const anchor = document.createElement("a"); // This will return our mock
      expect(anchor.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:url");
    });

    it("should handle download failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
        } as Response)
      );

      await downloadFile("https://example.com/fail.mp3", "fail.mp3");

      expect(consoleSpy).toHaveBeenCalledWith(
        "ダウンロードに失敗しました:",
        new Error("Network response was not ok")
      );
      consoleSpy.mockRestore();
    });
  });
});
