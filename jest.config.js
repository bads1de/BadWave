/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""], // Needed for some libraries (msw, etc) to work in JSDOM
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react$": "<rootDir>/node_modules/react",
    "^react-dom$": "<rootDir>/node_modules/react-dom",
    "^uuid$": "uuid",
  },
  transform: {
    "^.+.(ts|tsx|js|jsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
        babelConfig: true,
        jsx: "react-jsx", // Try react-jsx to match tsconfig mainly
      },
    ],
  },
  // Some libs (d3, react-query) might be ESM only, but let's see.
  // If react-query fails, usually transformIgnorePatterns needs adjustment
  transformIgnorePatterns: [
    "node_modules/(?!(node-fetch|@tanstack/react-query|uuid|@aws-sdk|@smithy|tailwind-merge|clsx|query-string|decode-uri-component|split-on-first|filter-obj)/)",
  ],
  testMatch: [
    "<rootDir>/__tests__/**/*.test.ts",
    "<rootDir>/__tests__/**/*.test.tsx",
  ],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
};
