/**
 * BABEL CONFIGURATION FOR CATTOWN
 * 
 * This configuration sets up Babel for JavaScript transpilation during testing.
 * Babel is used to transform modern ES6+ JavaScript to a format compatible
 * with the Node.js test environment.
 * 
 * Configuration:
 * - @babel/preset-env: Automatically determines necessary transforms based on target
 * - targets.node: 'current' ensures compatibility with the current Node.js version
 * 
 * Usage:
 * - Primarily used by Jest for transforming test files and source code during testing
 * - Enables ES6 modules, arrow functions, and other modern features in tests
 */

export default {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
