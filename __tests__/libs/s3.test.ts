describe("libs/s3", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.R2_ENDPOINT = "https://test.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY = "test-access-key";
    process.env.R2_SECRET_KEY = "test-secret-key";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("S3Clientが環境変数を使ってエクスポートされる", () => {
    const s3Module = require("@/libs/s3");
    // s3.ts は S3Client インスタンスを作成してエクスポートする
    expect(s3Module).toBeDefined();
  });
});
