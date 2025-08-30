export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/Tests/**/*.test.js"]
};
