import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  // usar base relativa para funcionar em previews/subpaths
  base: './',
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "grava-nois.ico",
        "favicon.ico",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        name: "Grava Nóis",
        short_name: "Grava Nóis",
        description:
          "Replays esportivos instantâneos — capture, compartilhe e baixe seus melhores lances.",
        lang: "pt-BR",
        // com base relativa, use caminhos relativos para funcionar em subpaths
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#0b0b0b",
        theme_color: "#0b0b0b",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globIgnores: ["**/assets/volleysvg-*.svg", "**/*.ttf", "**/*.eot"],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        // fallback de navegação segue para SPA (index.html) por padrão
        runtimeCaching: [
          // Imagens: Cache First com expiração
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-images',
              expiration: {
                maxEntries: 90,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },
          // Fontes locais (woff/woff2 importadas)
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Google Fonts stylesheets
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          // Google Fonts font files
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.css";`,
      },
    },
  },
  optimizeDeps: {
    exclude: ["vuetify"],
    entries: ["./src/**/*.vue"],
  },
});
