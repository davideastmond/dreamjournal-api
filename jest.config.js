module.exports = {
  testEnvironment: "node",
  verbose: true,
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  //collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*sandbox.ts"],
  "coveragePathIgnorePatterns": ["<rootDir>/dist"],
  "testPathIgnorePatterns": ["<rootDir>/dist"],
  "setupFilesAfterEnv": ["./jest.setup.js"],
};
