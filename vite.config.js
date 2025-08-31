import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'esbuild', // fast minifier for JS and CSS
    rollupOptions: {
      input: 'src/cattownMain.js', // your main JS entry
      output: {
        entryFileNames: 'cattownMain.js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});
