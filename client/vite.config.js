import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'DailyBite - Daily Meal Delivery',
        short_name: 'DailyBite',
        description: 'Fresh home-style meals delivered daily to your doorstep',
        theme_color: '#ff6b35',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Strategy 1: NetworkFirst — API calls
            // Always tries network first, falls back to cache if offline
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            // Strategy 2: CacheFirst — Images
            // Serves from cache first, only hits network if not cached
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Strategy 3: StaleWhileRevalidate — Static assets (JS, CSS)
            // Serves cached version immediately, updates cache in background
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Strategy 4: NetworkOnly — Real-time data (Socket.io)
            // Never caches — always fresh from network
            urlPattern: /\/socket\.io\/.*/,
            handler: 'NetworkOnly',
          },
          {
            // Strategy 5: CacheOnly — Offline page
            // Only serves from cache — for offline fallback
            urlPattern: /\/offline\.html/,
            handler: 'CacheOnly',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/socket.io': { target: 'http://127.0.0.1:3001', ws: true, changeOrigin: true },
    },
  },
});
