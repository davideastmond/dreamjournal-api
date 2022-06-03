module.exports = {
  testEnvironment: "node",
  verbose: true,
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  "coveragePathIgnorePatterns": ["<rootDir>/dist"],
  "testPathIgnorePatterns": ["<rootDir>/dist"],
};
