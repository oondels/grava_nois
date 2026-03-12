# Frontend Business Rules

## Session model

- a sessão depende de cookies HttpOnly e `withCredentials`;
- o frontend não deve persistir token sensível em `localStorage`;
- o app só monta após `auth.ensureReady()`;
- `checkAuth()` só limpa sessão em `401` ou `403`;
- erro de rede em `/auth/me` não deve deslogar o usuário automaticamente.

## Refresh behavior

- o interceptor de `api` tenta um único refresh em `401`;
- múltiplas requests concorrentes esperam numa fila enquanto o refresh ocorre;
- se refresh falhar, o auth store limpa sessão local e redireciona para `/login`;
- `apiNoRefresh` existe para rotas que não devem disparar refresh automático.

## Auth flows

- login por e-mail/senha usa `/auth/sign-in`;
- login Google depende de script carregado sob demanda;
- signup usa `/auth/sign-up`;
- sign-out chama `/auth/sign-out`;
- `change-password` usa endpoint público no frontend, mas o backend exige e-mail + senha atual;
- forgot/reset usam serviços dedicados sem refresh automático.

## Role and access UX

- guard de admin depende de `authStore.isAdmin`;
- guard de client aceita `role=client`, `clientId` ou `role=admin`;
- essas verificações são UX e não substituem RBAC do backend.

## Video experience

- a biblioteca depende de `quadrasFiliadas` presentes no usuário autenticado;
- `VideosPage.vue` decide entre experiência com quadras e estado sem quadra;
- download usa signed URL sob demanda e cache em memória por `bucket:path`;
- se a assinatura falhar, o código tenta usar `file.url` quando existir;
- listagem real usa `venueId` obrigatório.

## Portal cliente

- dashboard tenta usar dados reais e cai para mock em falha;
- financeiro usa `useClientPayments` com debounce de filtros;
- `client-portal.service` ainda tem métodos `getSubscriptionStatus` e `getInvoices` não implementados;
- `ClientProfile.vue` existe, mas está fora da navegação principal.

## Admin UX

- dashboard depende de `GET /admin/dashboard` e desenha gráficos locais;
- users/clients/venues têm edição inline via dialogs;
- clients mobile inclui painel expansível de cobranças;
- venues permite regenerar `deviceId` e `deviceSecret` pela UI.

## Support and notifications

- contato e reportar erro usam `apiNoRefresh`;
- `useSnackbar` encapsula Notivue e centraliza feedback simples por tipo;
- mensagens de erro preferem texto do backend quando disponível.

## PWA behavior

- atualização de versão é manual, via prompt do service worker;
- instalação é sugerida por modal próprio;
- iOS Safari recebe guia de instalação específico;
- o app shell pode ser usado offline de forma limitada, mas vídeos não devem ser tratados como cache offline primário.

## Current sharp edges visible in code

- `client.service.ts` usa endpoints legados `/client/profile`, enquanto o backend atual documentado usa `/api/clients/me`;
- `ClientProfile.vue` preenche e salva campos de endereço que não fazem parte do contrato principal atual do backend;
- `client-portal.service.getDashboardStats()` retorna `data.data`, mas `ClientDashboard.vue` procura `response.stats`;
- `clips` store é mock/legado e não representa a biblioteca real;
- o fluxo de `change-password` no frontend pode sugerir alteração de senha autenticada, mas o backend opera por `email + currentPassword + newPassword`;
- `WhatsNewDialog` está desligado por `const whatsNew = false` em `App.vue`.
