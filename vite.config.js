import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'cattown',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['dompurify'],
      output: {
        globals: {
          dompurify: 'DOMPurify'
        }
      }
    },
    minify: 'esbuild',
    sourcemap: true,
    cssCodeSplit: false,
    assetsInlineLimit: 0
  },
  css: {
    modules: false,
    postcss: null
  }
});
