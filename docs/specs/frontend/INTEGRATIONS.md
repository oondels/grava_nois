# Frontend Integrations

## Environment

Variáveis usadas no app:

- `VITE_API_BASE`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_MAINTENANCE_MODE`

Uso:

- `VITE_API_BASE`: base da API para `api` e `apiNoRefresh`
- `VITE_GOOGLE_CLIENT_ID`: inicialização do Google Identity Services
- `VITE_MAINTENANCE_MODE`: força redirect para `/maintenance`

## API integration layer

Camada principal:

- [`src/services/api.ts`](../../../src/services/api.ts)

Clientes:

- `api`: com refresh automático em `401`
- `apiNoRefresh`: sem refresh automático

Envelope esperado:

- `ApiResponse<T>` em [`src/types/Api.ts`](../../../src/types/Api.ts)

Observação:

- alguns services aceitam tanto o envelope padrão quanto payloads parcialmente divergentes.

## Main backend endpoints consumed

Auth:

- `GET /auth/me`
- `POST /auth/sign-in`
- `POST /auth/sign-up`
- `POST /auth/google`
- `POST /auth/sign-out`
- `POST /auth/refresh`
- `POST /auth/change-password`
- `POST /auth/password/forgot`
- `POST /auth/password/reset/verify`
- `POST /auth/password/reset`

Videos:

- `GET /api/videos/list`
- `GET /api/videos/sign`

Admin:

- `GET /admin/dashboard`
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `GET /admin/clients`
- `POST /admin/clients`
- `PATCH /admin/clients/:id`
- `GET /admin/clients/:id/payments`
- `GET /admin/venues`
- `PATCH /admin/venues/:id`

Client portal:

- `GET /api/clients/me/stats`
- `GET /api/clients/payments`

Legacy or inconsistent frontend calls:

- `GET /client/profile`
- `PATCH /client/profile`

Support:

- `POST /notifications/contact`
- `POST /notifications/report`

## PWA integration

Configuração em [`vite.config.ts`](../../../vite.config.ts):

- `registerType: "prompt"`
- cache de imagens, fontes e Google Fonts
- cache `NetworkFirst` para `GET /api/*`
- `navigateFallbackDenylist` bloqueia apenas `/api/*`
- manifest com screenshots, shortcuts e ícones maskable

Componentes de UX PWA:

- `InstallPrompt.vue`
- `ReloadPrompt.vue`

## Google Identity Services

Fluxo:

- script carregado sob demanda em `LoginPage.vue` via `loadGoogleScript`
- `google.accounts.id.initialize`
- callback envia `credential` para `authStore.signInWithGoogleCredential`

## External browser APIs

- `localStorage` para:
  - `postAuthRedirect`
  - dismiss do install prompt
  - versão vista no `WhatsNewDialog`
- `window.open` para links de pagamento
- `ResizeObserver` para re-render do botão Google
- `serviceWorker.getRegistrations().update()` em falha de chunk

## HTTP-specific notes

- requests usam `withCredentials: true` por padrão;
- suporte e recuperação de senha preferem `apiNoRefresh`;
- `videos.ts` ainda envia `bucket` em `signDownload`, embora o backend atual priorize `path` e `kind`;
- filtros e paginação de pagamentos são montados no frontend antes do request.
