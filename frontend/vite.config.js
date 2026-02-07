import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png', 'screenshot-wide.png', 'screenshot-narrow.png'],
      manifest: {
        name: 'GrowWise',
        short_name: 'GrowWise',
        description: 'Smart AI money tracking with effortless entry, deep insights, and personalized savings advice have this ',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192 1024x1024',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512 1024x1024',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512 1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'GrowWise Desktop Dashboard'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '360x640',
            type: 'image/png',
            label: 'GrowWise Mobile View'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 12000000
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {
    allowedHosts: true
  }
})