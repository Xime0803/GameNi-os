import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        panel: resolve(__dirname, 'panel.html'),
      },
    },
    target: 'esnext',
  },
  server: {
    port: 3000,
    open: true,
  },
});
