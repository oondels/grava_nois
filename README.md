# Grava Nóis – Plataforma Web de Replays Esportivos

Versão atual do app: `1.2.0` (conforme `package.json`).

## Visão geral
O **Grava Nóis** é uma aplicação web/PWA para consumo de replays esportivos de quadras e campos amadores.
O frontend consome APIs de autenticação, vídeos e gestão (admin/cliente), com sessão baseada em cookies (`withCredentials`).

Lookup principal para auditoria e navegação técnica: [`docs/specs/DESIGN_SPEC.md`](docs/specs/DESIGN_SPEC.md).

## O que este repositório entrega
- Web app e PWA para usuários finais, clientes e administradores.
- Login por email/senha e Google (Google Identity Services).
- Fluxo de alteração de senha para usuário autenticado.
- Fluxo completo de recuperação de senha por e-mail (`forgot` + `reset` por token em hash `#token=...`).
- Listagem de vídeos por quadra com paginação forward (`nextToken`), preview sob demanda e download por URL assinada.
- Painel administrativo com dashboard e gestão de usuários/clientes/quadras.
- Dashboard administrativo com gráficos (barra, donut e linha) baseados em `GET /admin/dashboard`.
- Gestão de clientes no admin com vínculo/desvínculo de cliente para usuário.
- Painel de cliente com visão geral e financeiro (com fallback para dados mock em endpoints ainda não implementados).
- Páginas de suporte: contato (solicitação de instalação) e relatório de erro.

## Stack
- Vue 3 + TypeScript
- Vite + `vite-plugin-pwa`
- Vuetify 3 + Tailwind CSS
- ApexCharts (`vue3-apexcharts`)
- Pinia
- Axios
- Notivue

## Configuração de ambiente
Crie `.env` (ou `.env.local`) na raiz:

```dotenv
VITE_API_BASE=https://api.gravanois.com
VITE_GOOGLE_CLIENT_ID=<google_oauth_client_id>
VITE_MAINTENANCE_MODE=false
```

- `VITE_API_BASE`: base da API.
- `VITE_GOOGLE_CLIENT_ID`: client id do Google OAuth.
- `VITE_MAINTENANCE_MODE`: se `true|1|on|yes`, redireciona para `/maintenance`.

## Scripts
```bash
npm install
npm run dev
npm run build
npm run preview
npm run test
```

Observação:
- `npm run build` está funcionando no estado atual.
- `npm run test` está configurado, porém atualmente falha por incompatibilidade de CLI do Vitest (flag `--setupFiles` inválida na versão em uso), com ajuste pendente.

## Rotas principais
- `/` Home
- `/lances-gravanois` vídeos do usuário (requer autenticação)
- `/login`, `/register`
- `/auth/change-password` (alias legado `/auth/update-password`)
- `/auth/forgot-password`
- `/auth/password/reset`
- `/auth/callback`
- `/user-page`
- `/contato`
- `/reportar-erro`
- `/maintenance`
- `/admin`, `/admin/users`, `/admin/clients`, `/admin/venues` (somente admin)
- `/client`, `/client/quadra`, `/client/financeiro` (usuário autenticado com perfil cliente/admin)

## Integração com API
Principais endpoints usados no frontend:

Autenticação:
- `GET /auth/me`
- `POST /auth/sign-in`
- `POST /auth/sign-up`
- `POST /auth/google`
- `POST /auth/sign-out`
- `POST /auth/refresh`
- `POST /auth/change-password`

Recuperação de senha:
- `POST /auth/password/forgot`
- `POST /auth/password/reset/verify`
- `POST /auth/password/reset`

Vídeos:
- `GET /api/videos/list`
- `GET /api/videos/sign`

Admin:
- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/clients`
- `GET /admin/venues`
- `POST /admin/clients` (cadastro de cliente com `provider` e `venueData` opcional)
- `PATCH /admin/users/:id`
- `PATCH /admin/clients/:id` (inclui vínculo/desvínculo por `userId`)

Portal cliente:
- `GET /api/clients/me/stats`
- `GET /client/profile`
- `PATCH /client/profile`

Perfil de usuário:
- `GET /users/:id`
- `PATCH /users/:id`
- `PATCH /users/:id/location`

Suporte/notificações:
- `POST /notifications/report`
- `POST /notifications/contact`

Observações:
- `report` e `contact` usam o cliente `apiNoRefresh` (sem refresh automático em 401).
- Alguns fluxos do portal cliente (`assinatura` e `faturas`) ainda estão com implementação de API pendente e fallback mock no frontend.

## Envelope de resposta da API

```ts
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: { code: string; details?: any };
  requestId?: string;
  meta?: { page?: number; limit?: number; total?: number };
};
```

## PWA
- Registro de Service Worker em modo `prompt` (atualização sob confirmação do usuário).
- Cache de runtime (imagens, fontes e Google Fonts).
- Prompt customizado de instalação.
- Prompt de atualização de versão.

## Estrutura de pastas
```txt
src/
├── assets/
├── components/
├── layouts/
├── pages/
├── router/
├── services/
├── store/
├── styles/
├── test/
├── types/
├── utils/
└── config/
```

## Versionamento
- Convenção SemVer (`MAJOR.MINOR.PATCH`).
- Versão atual do pacote: `1.2.0`.
- `CHANGELOG.md` ainda não possui entrada da `1.2.0` (pendente de atualização).

## Licença
MIT
