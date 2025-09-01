/**
 * JEST TESTING CONFIGURATION FOR CATTOWN
 * 
 * This configuration sets up Jest testing framework for Cattown's test suite.
 * It defines how tests are discovered, transformed, and executed, plus coverage
 * collection settings.
 * 
 * Key Settings:
 * - clearMocks: Automatically clears mock calls between tests for isolation
 * - collectCoverage: Generates code coverage reports during test runs
 * - coverageDirectory: Stores coverage reports in ./coverage/ folder
 * - transform: Uses babel-jest to transform ES6+ code for Node.js compatibility
 * - testEnvironment: Uses Node.js environment (not browser/DOM simulation)
 * - testMatch: Discovers test files in Tests/ directory with .test.js suffix
 * 
 * Coverage Reports:
 * - HTML reports available at coverage/lcov-report/index.html
 * - JSON and lcov formats for CI integration
 */

export default {
  clearMocks: true,                              // Reset mocks between tests
  collectCoverage: true,                         // Generate coverage reports
  coverageDirectory: "coverage",                 // Coverage output directory
  transform: {
    '^.+\\.js$': 'babel-jest',                  // Transform JS files with Babel
  },
  testEnvironment: "node",                       // Node.js test environment
  testMatch: ["<rootDir>/Tests/**/*.test.js"]    // Test file discovery pattern
};
