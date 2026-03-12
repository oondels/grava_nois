# Frontend Architecture

## Overview

`grava_nois` é uma SPA Vue 3 com suporte PWA. O app atende três áreas principais:

- experiência pública e de autenticação;
- biblioteca de vídeos para usuários autenticados;
- painéis administrativos e portal do cliente.

## Bootstrap

Bootstrap em [`src/main.ts`](../../../src/main.ts):

1. cria app Vue;
2. registra Pinia;
3. registra router;
4. registra Vuetify;
5. registra Notivue;
6. conecta interceptors HTTP ao auth store;
7. chama `auth.ensureReady()` antes do `mount`.

Consequência importante:

- o app só monta depois de resolver o estado inicial de sessão.

## Global shell

Shell global em [`src/App.vue`](../../../src/App.vue) e [`src/layouts/AppLayout.vue`](../../../src/layouts/AppLayout.vue):

- `ReloadPrompt` para atualização do service worker;
- `InstallPrompt` para instalação PWA;
- `WhatsNewDialog` versionado por `localStorage`;
- `AppLayout` com fallback de erro de rota e transição simples;
- `AppShell` decide header, footer e bottom nav conforme rota.

## UI stack

- Vue 3 + TypeScript
- Vue Router
- Pinia
- Vuetify 3
- Tailwind utilitário
- Notivue para notificações
- ApexCharts no admin

## Main frontend modules

### Auth/session

- store: [`src/store/auth.ts`](../../../src/store/auth.ts)
- HTTP interceptors: [`src/services/api.ts`](../../../src/services/api.ts)
- pages: login, cadastro, mudança de senha, forgot/reset, callback OAuth

### Video library

- pages: [`src/pages/VideosPage.vue`](../../../src/pages/VideosPage.vue)
- services: [`src/services/videos.ts`](../../../src/services/videos.ts)
- depende de `quadrasFiliadas` do usuário autenticado

### Admin

- layout dedicado: [`src/layouts/AdminLayout.vue`](../../../src/layouts/AdminLayout.vue)
- pages: dashboard, users, clients, venues
- service agregado: [`src/services/admin.service.ts`](../../../src/services/admin.service.ts)

### Client portal

- layout dedicado: [`src/layouts/ClientLayout.vue`](../../../src/layouts/ClientLayout.vue)
- pages: dashboard/financeiro
- services: `client-portal.service`, `client-payments.service`, `client.service`

### Support

- pages: contato, reportar erro
- services: `solicitarInstalacao`, `sendReport`

## State model

### Global state actively used

- `auth`: sessão, papel, loading, readiness, updatePassword
- `theme`: tema atual

### Secondary or legacy state

- `clips`: store mock de clips esportivos; não é o fluxo principal da biblioteca real

## Route-driven layouts

- rotas públicas e de consumo usam `AppShell`;
- `/admin/*` usa `AdminLayout`;
- `/client/*` usa `ClientLayout`;
- maintenance mode intercepta navegação no router.

## PWA architecture

Configuração em [`vite.config.ts`](../../../vite.config.ts):

- registro `prompt`;
- app shell cacheado;
- runtime caching para imagens, fontes e GETs de API;
- prompt manual de atualização;
- prompt manual de instalação com fallback específico para iOS Safari.

## Architectural constraints

- o frontend depende de cookies HttpOnly, não de tokens em `localStorage`;
- guards de rota são UX, não substituem autorização do backend;
- várias páginas consomem envelopes `ApiResponse<T>`, mas alguns services também toleram payloads fora do envelope;
- parte do portal cliente ainda tem gaps de integração real e usa fallback mock ou endpoints legados.
