import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind()
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/reading': 'http://localhost:3001'
    }
  }
});

