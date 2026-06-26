import { ERROR_MESSAGES } from "@/constants/errorMessages";

describe("constants/errorMessages", () => {
  it("all error messages should be non-empty strings", () => {
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("should contain expected keys", () => {
    expect(ERROR_MESSAGES).toHaveProperty("ADMIN_REQUIRED");
    expect(ERROR_MESSAGES).toHaveProperty("LOGIN_REQUIRED");
    expect(ERROR_MESSAGES).toHaveProperty("GENERIC_ERROR");
    expect(ERROR_MESSAGES).toHaveProperty("UPLOAD_FAILED");
    expect(ERROR_MESSAGES).toHaveProperty("DELETE_FAILED");
  });
});
