import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',        // show update toast manually
      injectRegister: 'auto',
      includeAssets: ['mainLogo.png', 'favicon.ico', '*.jpg', '*.png'],
      manifest: {
        name: 'LifeOS',
        short_name: 'LifeOS',
        description: 'مدیریت هوشمند اشتراک‌ها و هزینه‌های ماهانه',
        theme_color: '#3B82F6',
        background_color: '#0B1220',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'fa',
        dir: 'rtl',
        icons: [
          {
            src: '/mainLogo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/mainLogo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/mainLogo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['finance', 'productivity'],
        screenshots: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: false,   // we control update via prompt
      },
      devOptions: {
        enabled: false,   // only active in production build
      },
    }),
  ],
});
