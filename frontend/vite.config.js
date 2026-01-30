import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const basePath = mode === 'production'
    ? '/lector-codigos/'
    : '/'

  return {
    base: basePath,

    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icons/*.png', 'manifest.json'],

        manifest: {
          name: 'Lector de Inventarios',
          short_name: 'Inventario',
          description: 'PWA de inventarios para Zebra MC930B',

          start_url: basePath,
          scope: basePath,

          display: 'standalone',
          orientation: 'portrait',
          background_color: '#1a1a2e',
          theme_color: '#f89520',

          icons: [
            {
              src: `${basePath}icons/icon-192.png`,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: `${basePath}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: `${basePath}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot}'],

          navigateFallback: `${basePath}index.html`,
          navigateFallbackDenylist: [/^\/api/],

          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/.*\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24
                },
                networkTimeoutSeconds: 5,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            },
            {
              urlPattern: /\.(?:woff2|woff|ttf|eot)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7
                }
              }
            }
          ],

          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true
        },

        devOptions: {
          enabled: false
        }
      })
    ],

    server: {
      port: 5173,
      host: true
    },

    build: {
      target: 'es2017',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  }
})
