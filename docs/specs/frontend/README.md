# Frontend Lookup

Este arquivo é a porta de entrada do frontend para leitura humana e lookup por code agents. A ideia é localizar rapidamente a área correta e só então abrir páginas, stores e services.

## Frontend Overview

- Keywords: frontend, vue, pwa, grava nois, web app, visão geral
- File: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Related: bootstrap, shell, session boot, layouts

## App Bootstrap

- Keywords: main, app, mount, pinia, vuetify, interceptors, notivue
- File: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Source: [`src/main.ts`](../../../src/main.ts), [`src/App.vue`](../../../src/App.vue)
- Related: auth boot, dark theme, global prompts

## Routing and Guards

- Keywords: router, routes, auth guard, admin, client, maintenance, navigation
- File: [ROUTES.md](./ROUTES.md), [BUSINESS_RULES.md](./BUSINESS_RULES.md)
- Source: [`src/router/index.ts`](../../../src/router/index.ts)
- Related: `requiresAuth`, `requiresGuest`, admin layout, client layout

## Authentication and Session

- Keywords: auth, login, google, refresh, session, cookies, sign-out
- File: [BUSINESS_RULES.md](./BUSINESS_RULES.md), [INTEGRATIONS.md](./INTEGRATIONS.md)
- Source: [`src/store/auth.ts`](../../../src/store/auth.ts), [`src/services/api.ts`](../../../src/services/api.ts)
- Related: `ensureReady`, `/auth/me`, refresh queue, change password

## Video Experience

- Keywords: videos, quadras filiadas, listagem, download, signed url, clips
- File: [ROUTES.md](./ROUTES.md), [BUSINESS_RULES.md](./BUSINESS_RULES.md), [INTEGRATIONS.md](./INTEGRATIONS.md)
- Source: [`src/pages/VideosPage.vue`](../../../src/pages/VideosPage.vue), [`src/services/videos.ts`](../../../src/services/videos.ts)
- Related: venue selection, preview/download, authenticated library

## Admin Area

- Keywords: admin, dashboard, users, clients, venues
- File: [ROUTES.md](./ROUTES.md), [INTEGRATIONS.md](./INTEGRATIONS.md)
- Source: [`src/layouts/AdminLayout.vue`](../../../src/layouts/AdminLayout.vue), [`src/services/admin.service.ts`](../../../src/services/admin.service.ts)
- Related: charts, CRUD operacional, billing visibility

## Client Portal

- Keywords: client, financeiro, perfil, dashboard, payments
- File: [ROUTES.md](./ROUTES.md), [BUSINESS_RULES.md](./BUSINESS_RULES.md), [INTEGRATIONS.md](./INTEGRATIONS.md)
- Source: [`src/layouts/ClientLayout.vue`](../../../src/layouts/ClientLayout.vue), [`src/services/client-portal.service.ts`](../../../src/services/client-portal.service.ts)
- Related: mock fallback, invoices, profile gaps

## PWA and Shell

- Keywords: pwa, service worker, install prompt, update prompt, app shell
- File: [ARCHITECTURE.md](./ARCHITECTURE.md), [INTEGRATIONS.md](./INTEGRATIONS.md)
- Source: [`vite.config.ts`](../../../vite.config.ts), [`src/components/InstallPrompt.vue`](../../../src/components/InstallPrompt.vue), [`src/components/ReloadPrompt.vue`](../../../src/components/ReloadPrompt.vue)
- Related: runtime caching, install UX, update flow

## Notifications and Support

- Keywords: notivue, snackbar, contato, reportar erro, support
- File: [BUSINESS_RULES.md](./BUSINESS_RULES.md), [INTEGRATIONS.md](./INTEGRATIONS.md)
- Source: [`src/composables/useSnackbar.ts`](../../../src/composables/useSnackbar.ts), [`src/services/sendReport.ts`](../../../src/services/sendReport.ts), [`src/services/solicitarInstalacao.ts`](../../../src/services/solicitarInstalacao.ts)
- Related: apiNoRefresh, feedback UX, support pages

## Suggested Reading Order

- Geral: [ARCHITECTURE.md](./ARCHITECTURE.md) -> [ROUTES.md](./ROUTES.md)
- Auth/sessão: [BUSINESS_RULES.md](./BUSINESS_RULES.md) -> [INTEGRATIONS.md](./INTEGRATIONS.md)
- Fluxo de tela: [ROUTES.md](./ROUTES.md) -> página/layout correspondente
- PWA/build/testes: [INTEGRATIONS.md](./INTEGRATIONS.md) -> [OPERATIONS.md](./OPERATIONS.md)
