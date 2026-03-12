# Frontend Routes

## Public routes

### `/`

- Page: `HomePage.vue`
- Uso: landing page pública

### `/login`

- Page: `LoginPage.vue`
- Meta: `requiresGuest`
- Fluxos:
  - login por e-mail/senha
  - login Google
  - redirect para `postAuthRedirect`

### `/register`

- Page: `RegisterPage.vue`
- Meta: `requiresGuest`
- Uso: cadastro por e-mail/senha

### `/auth/change-password`
### `/auth/update-password`

- Page: `pages/auth/ResetPassword.vue`
- Observação: rota aberta; o fluxo atual pede e-mail + senha atual + nova senha

### `/auth/forgot-password`

- Page: `pages/auth/ForgotPassword.vue`
- Uso: solicitar reset por e-mail

### `/auth/password/reset`

- Page: `pages/auth/EmailResetPassword.vue`
- Uso: consumir token vindo no hash `#token=...`

### `/auth/callback`

- Page: `pages/auth/AuthCallback.vue`
- Uso: callback de auth/OAuth

### `/contato`

- Page: `ContactPage.vue`
- Uso: solicitar instalação / contato comercial

### `/reportar-erro`

- Page: `ReportErrorPage.vue`
- Uso: relatório manual de erro

### `/maintenance`

- Page: `MaintenanceMode.vue`
- Uso: página forçada por `VITE_MAINTENANCE_MODE`

### `/:pathMatch(.*)*`

- Page: `NotFoundPage.vue`
- Uso: fallback 404 do frontend

## Authenticated user routes

### `/lances-gravanois`

- Page: `VideosPage.vue`
- Meta: `requiresAuth`
- Regra:
  - se `quadrasFiliadas` existir, renderiza fluxo com quadras disponíveis;
  - senão, renderiza estado sem quadra.

### `/user-page`

- Page: `UserPage.vue`
- Meta: `requiresAuth`
- Uso: perfil do usuário autenticado

## Admin area

Todas as rotas abaixo usam `AdminLayout.vue` e dependem de `authStore.ensureReady()` no `beforeEnter`.

### `/admin`

- Page: `pages/admin/AdminDashboard.vue`
- Regra: apenas `isAdmin`

### `/admin/users`

- Page: `pages/admin/AdminUsers.vue`
- Uso: listagem e edição de role/status

### `/admin/clients`

- Page: `pages/admin/AdminClients.vue`
- Uso: cadastro, edição e consulta de cobranças

### `/admin/venues`

- Page: `pages/admin/AdminVenues.vue`
- Uso: edição operacional/comercial de quadras e credenciais de device

## Client area

Todas as rotas abaixo usam `ClientLayout.vue` e dependem de `authStore.ensureReady()` no `beforeEnter`.

Regra de entrada:

- permite `role=client`;
- permite usuário com `clientId`;
- também permite `role=admin`.

### `/client`

- Page: `pages/client/ClientDashboard.vue`
- Uso: visão geral do cliente

### `/client/quadra`

- Page: `pages/client/ClientDashboard.vue`
- Observação:
  - a rota existe, mas o item correspondente está comentado no menu lateral;
  - reutiliza a mesma página de dashboard com outro `title`.

### `/client/financeiro`

- Page: `pages/client/ClientFinance.vue`
- Uso: filtros, tabela e paginação de pagamentos

## Route guards and navigation behavior

Regras do router:

- maintenance mode redireciona qualquer rota para `/maintenance`;
- `requiresAuth` envia usuário para `/login` e salva `postAuthRedirect`;
- `requiresGuest` redireciona autenticado para `/lances-gravanois`;
- admin e client usam `beforeEnter` específico;
- `scrollBehavior` restaura posição, suporta hash e faz scroll to top nas demais navegações;
- erro de chunk dinâmico tenta atualizar service worker e recarregar a página.

## Route gaps and notable absences

- `ClientProfile.vue` existe no código, mas não está roteada;
- o portal cliente não expõe rota explícita de perfil hoje;
- `AdminPlaceholderPage.vue` existe, mas não participa da árvore principal.
