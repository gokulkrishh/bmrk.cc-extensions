import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

import manifest from './manifest.config';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      lib: path.resolve(__dirname, './src/lib'),
    },
  },
});
