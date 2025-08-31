import { defineConfig } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

export default defineConfig({
  input: 'src/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    name: 'cattown',
    exports: 'named'
  },
  plugins: [
    resolve(),
    commonjs(),
    postcss({
      extract: 'markdownStyles.css',
      minimize: true,
      sourceMap: true
    })
  ],
  external: ['dompurify'],
  onwarn(warning, warn) {
    // Suppress CSS import warnings
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.source === 'dompurify') {
      return;
    }
    warn(warning);
  }
});
