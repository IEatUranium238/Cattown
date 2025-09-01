/**
 * VITE CONFIGURATION FOR ES MODULES BUILD
 * 
 * This configuration builds Cattown for modern ES modules environments.
 * Vite provides fast builds with esbuild and creates the dist/index.js file
 * for modern bundlers and browsers that support ES modules.
 * 
 * Build Configuration:
 * - Library mode: Optimized for package distribution
 * - ES modules format: Compatible with modern bundlers
 * - External dependencies: DOMPurify excluded from bundle
 * - CSS handling: Extracted and not code-split
 * - Minification: esbuild for fast, efficient minification
 * 
 * Output Files:
 * - dist/index.js: Main ES module bundle
 * - dist/index.js.map: Source map for debugging
 * - dist/markdownStyles.css: Extracted CSS styles
 */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',                    // Entry point for library build
      name: 'cattown',                          // Global variable name
      fileName: 'index',                        // Output filename (without extension)
      formats: ['es']                           // ES modules format only
    },
    rollupOptions: {
      external: ['dompurify'],                  // External dependencies (not bundled)
      output: {
        globals: {
          dompurify: 'DOMPurify'                // Global variable mapping for externals
        }
      }
    },
    minify: 'esbuild',                          // Fast minification with esbuild
    sourcemap: true,                            // Generate source maps
    cssCodeSplit: false,                        // Keep CSS in single file
    assetsInlineLimit: 0                        // Don't inline any assets
  },
  css: {
    modules: false,                             // Disable CSS modules
    postcss: null                               // No PostCSS processing (handled by build)
  }
});
