import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // نسجّل الـ SW يدوياً في main.tsx مع cache-busting + updateViaCache:'none'
      // حتى لا يعلق المستخدمون على نسخة SW قديمة مخزّنة في CDN/المتصفح.
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Motech POS',
        short_name: 'Motech POS',
        description: 'نقطة بيع Motech — بديل web حديث عن Onyx Pro',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#0f766e',
        background_color: '#0b1220',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        icons: [
          { src: 'pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // App shell: precache build assets (Cache-First via Workbox precache).
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Catalog/price reads → StaleWhileRevalidate (STANDARDS/02 §4).
            urlPattern: ({ url }) => url.pathname.includes('/api/v1/items'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'catalog-cache',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
        // Selling POSTs are NEVER cached by SW — handled via offline queue.
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  define: {
    __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
  build: {
    rolldownOptions: {
      output: {
        // Split big, rarely-changing vendors out of the initial bundle.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (/react-router|react-dom|\/react\//.test(id)) return 'react-vendor';
            if (id.includes('@tanstack')) return 'query';
            if (id.includes('i18next')) return 'i18n';
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:3100', changeOrigin: true },
      '/health': { target: 'http://localhost:3100', changeOrigin: true },
    },
  },
});
