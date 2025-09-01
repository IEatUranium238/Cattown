/**
 * ROLLUP CONFIGURATION FOR COMMONJS BUILD
 * 
 * This configuration builds Cattown for CommonJS environments (Node.js, older bundlers).
 * It creates the dist/index.cjs file that can be imported with require() syntax.
 * 
 * Build Process:
 * 1. Bundles src/index.js and dependencies
 * 2. Resolves Node.js modules and CommonJS dependencies
 * 3. Extracts and processes CSS files
 * 4. Outputs CommonJS format with named exports
 * 
 * Key Features:
 * - Entry: src/index.js (main library file)
 * - Output: dist/index.cjs (CommonJS format)
 * - CSS: Extracted to separate markdownStyles.css file
 * - External: DOMPurify remains external dependency
 * - Plugins: Node resolution, CommonJS conversion, PostCSS processing
 */

import { defineConfig } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

export default defineConfig({
  input: 'src/index.js',                         // Entry point
  output: {
    file: 'dist/index.cjs',                     // CommonJS output file
    format: 'cjs',                              // CommonJS format
    name: 'cattown',                            // Global variable name
    exports: 'named'                            // Use named exports
  },
  plugins: [
    resolve(),                                   // Resolve Node.js modules
    commonjs(),                                  // Convert CommonJS to ES modules
    postcss({
      extract: 'markdownStyles.css',             // Extract CSS to separate file
      minimize: true,                            // Minify CSS
      sourceMap: true                            // Generate CSS source maps
    })
  ],
  external: ['dompurify'],                       // Keep DOMPurify as external dependency
  onwarn(warning, warn) {
    // Suppress specific warnings for cleaner build output
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.source === 'dompurify') {
      return;
    }
    warn(warning);
  }
});
