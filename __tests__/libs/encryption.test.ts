/**
 * @jest-environment node
 */
import { Encryption } from "@/libs/encryption";

describe("libs/encryption", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Set a mock key for testing. Key needs to be a string.
    process.env.ENCRYPTION_KEY = "test-encryption-key-must-be-long-enough";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should encrypt and decrypt correctly", () => {
    const originalText = "Hello World! 123";
    const encrypted = Encryption.encrypt(originalText);

    expect(encrypted).not.toBe(originalText);
    // Format check: salt:iv:encrypted
    expect(encrypted.split(":")).toHaveLength(3);

    const decrypted = Encryption.decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it("should handle empty string", () => {
    const originalText = "";
    const encrypted = Encryption.encrypt(originalText);
    const decrypted = Encryption.decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it("should handle special characters", () => {
    const originalText = "日本語テスト 🌟 ✨";
    const encrypted = Encryption.encrypt(originalText);
    const decrypted = Encryption.decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it("should throw error if key is missing (encrypt)", () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => {
      Encryption.encrypt("test");
    }).toThrow("Encryption key is not set");
  });

  it("should throw error if key is missing (decrypt)", () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => {
      Encryption.decrypt("some:encrypted:text");
    }).toThrow("Encryption key is not set");
  });

  it("should produce different ciphertexts for same text due to random salt/iv", () => {
    const text = "Same Text";
    const encrypted1 = Encryption.encrypt(text);
    const encrypted2 = Encryption.encrypt(text);

    expect(encrypted1).not.toBe(encrypted2);
    expect(Encryption.decrypt(encrypted1)).toBe(text);
    expect(Encryption.decrypt(encrypted2)).toBe(text);
  });
});
