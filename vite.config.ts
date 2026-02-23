import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  // Use base absoluta para evitar 404 de assets quando app abre em subpaths (ex: /auth/callback no PWA)
  base: '/',
  plugins: [
    vue(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "grava-nois.ico",
        "favicon.ico",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        "name": "Grava Nóis",
        "short_name": "Grava Nóis",
        "id": "/",
        "description": "Replays esportivos instantâneos — capture, compartilhe e baixe seus melhores lances.",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#0b0b0b",
        "theme_color": "#0b0b0b",
        "lang": "pt-BR",
        "scope": "/",
        "orientation": "portrait",
        "screenshots": [
          {
            "src": "screenshots/home_view.jpeg",
            "sizes": "783x1600",
            "type": "image/jpeg",
            "form_factor": "narrow"
          },
          {
            "src": "screenshots/replays_view.jpeg",
            "sizes": "783x1600",
            "type": "image/jpeg",
            "form_factor": "narrow"
          },
          {
            "src": "screenshots/home_wide.webp",
            "sizes": "1280x853",
            "type": "image/webp",
            "form_factor": "wide"
          }
        ],
        "shortcuts": [
          {
            "name": "Contato",
            "url": "/contato",
            "icons": [{ "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" }]
          },
          {
            "name": "Lances GravaNois",
            "url": "/lances-gravanois",
            "description": "Listagem de vídeos gerados e disponíveis para download.",
            "icons": [{ "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" }]
          },
          {
            "name": "Login",
            "url": "/login",
            "icons": [{ "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" }]
          },
          {
            "name": "Cadastro",
            "url": "/register",
            "icons": [{ "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" }]
          },
          {
            "name": "Página do Usuário",
            "url": "/user-page",
            "icons": [{ "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" }]
          },
          {
            "name": "Reportar Problemas",
            "url": "/reportar-erro",
            "icons": [{ "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" }]
          }
        ],
        "icons": [
          { "src": "pwa-64x64.png", "sizes": "64x64", "type": "image/png" },
          { "src": "pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
          { "src": "pwa-512x512.png", "sizes": "512x512", "type": "image/png" },
          { "src": "maskable-icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
        ],
        "categories": ["sports", "navigation", "entertainment"],
      }
      ,
      workbox: {
        clientsClaim: true,
        // Em modo prompt, o novo SW deve ficar em "waiting" até o usuário confirmar.
        skipWaiting: false,
        cleanupOutdatedCaches: true,
        globIgnores: [
          "**/assets/volleysvg-*.svg",
          "**/*.ttf",
          "**/*.eot",
          "**/assets/*-about-*.webp",
          "**/assets/feed-preview-*.webp",
        ],
        globPatterns: ["**/*.{js,css,ico,png,svg,webp,avif,html}"],
        // fallback de navegação segue para SPA (index.html) por padrão
        // Não negar /auth para permitir que o SPA processe o callback do OAuth
        navigateFallbackDenylist: [/^\/api\//],
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
          // API GET: prioriza rede e usa cache de curta duração como fallback.
          {
            urlPattern: ({ request, url }) => request.method === "GET" && /^\/api\//.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-get-cache",
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 5 },
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
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("vuetify")) return "vendor-vuetify";
          if (id.includes("vue-router")) return "vendor-router";
          if (id.includes("pinia")) return "vendor-state";
          if (id.includes("notivue")) return "vendor-notifications";
          if (id.includes("@iconify") || id.includes("@mdi") || id.includes("lucide-vue-next")) {
            return "vendor-icons";
          }
          if (id.includes("axios")) return "vendor-http";

          return "vendor-core";
        },
      },
    },
  },
});
