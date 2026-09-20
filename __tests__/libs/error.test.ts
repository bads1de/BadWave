import { getErrorMessage } from "@/libs/utils/error";

describe("libs/utils/error", () => {
  describe("getErrorMessage", () => {
    it("Errorインスタンスの場合はmessageを返す", () => {
      const error = new Error("Test error message");
      expect(getErrorMessage(error)).toBe("Test error message");
    });

    it("Supabase風のエラーオブジェクトの場合はmessageを返す", () => {
      const error = { message: "DB Error", code: "23505", details: "unique violation" };
      expect(getErrorMessage(error)).toBe("DB Error");
    });

    it("messageプロパティを持つオブジェクトの場合はmessageを返す", () => {
      const error = { message: "Custom error" };
      expect(getErrorMessage(error)).toBe("Custom error");
    });

    it("messageプロパティがない場合はfallbackを返す", () => {
      const error = { code: "UNKNOWN", details: "something" };
      expect(getErrorMessage(error)).toBe("Unknown error");
    });

    it("文字列の場合はfallbackを返す", () => {
      expect(getErrorMessage("string error")).toBe("Unknown error");
    });

    it("数値の場合はfallbackを返す", () => {
      expect(getErrorMessage(42)).toBe("Unknown error");
    });

    it("nullの場合はfallbackを返す", () => {
      expect(getErrorMessage(null)).toBe("Unknown error");
    });

    it("undefinedの場合はfallbackを返す", () => {
      expect(getErrorMessage(undefined)).toBe("Unknown error");
    });

    it("カスタムfallbackを指定できる", () => {
      expect(getErrorMessage(null, "カスタムエラー")).toBe("カスタムエラー");
      expect(getErrorMessage("error", "カスタムエラー")).toBe("カスタムエラー");
    });

    it("Errorインスタンスでもカスタムfallbackが使える（エラー時はmessageが優先）", () => {
      const error = new Error("Error wins");
      expect(getErrorMessage(error, "Fallback")).toBe("Error wins");
    });

    it("空のmessageを持つオブジェクトの場合はfallbackを返す", () => {
      expect(getErrorMessage({ message: "" })).toBe("Unknown error");
      expect(getErrorMessage({ message: "   " })).toBe("Unknown error");
    });

    it("空のmessageを持つErrorの場合はfallbackを返す", () => {
      expect(getErrorMessage(new Error(""))).toBe("Unknown error");
    });

    it("messageが文字列・数値以外のオブジェクトの場合はfallbackを返す", () => {
      expect(getErrorMessage({ message: true })).toBe("Unknown error");
      expect(getErrorMessage({ message: {} })).toBe("Unknown error");
    });

    it("messageが数値のオブジェクトの場合は文字列に変換して返す", () => {
      const error = { message: 123 };
      expect(getErrorMessage(error)).toBe("123");
    });

    it("messageがnullのオブジェクトの場合はfallbackを返す（\"null\"にしない）", () => {
      expect(getErrorMessage({ message: null })).toBe("Unknown error");
    });

    it("messageがundefinedのオブジェクトの場合はfallbackを返す（\"undefined\"にしない）", () => {
      expect(getErrorMessage({ message: undefined })).toBe("Unknown error");
    });
  });
});
