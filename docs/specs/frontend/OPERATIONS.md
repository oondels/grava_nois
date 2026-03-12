# Frontend Operations

## Build and runtime

Scripts principais em `package.json`:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`

Estado atual:

- build está funcional;
- o script de teste está configurado, mas o README já registra falha por incompatibilidade de CLI do Vitest com `--setupFiles`.

## Theme and visual runtime

- o app sobe em dark mode por padrão;
- `themeStore.setTheme(true)` é aplicado no mount;
- `document.documentElement.dataset.theme = "dark"` é forçado em `App.vue`.

## Error handling behavior

- erros de rota são capturados em `AppLayout.vue` com fallback de UI;
- falha de chunk dinâmico tenta atualizar o SW e recarregar a página;
- services preferem transformar payload do backend em mensagens amigáveis;
- `useSnackbar` centraliza feedback rápido com Notivue.

## Test coverage present in repo

Arquivos de teste visíveis:

- `src/utils/viaCep.spec.ts`
- `src/utils/passwordRecovery.spec.ts`
- `src/pages/auth/ForgotPassword.spec.ts`
- `src/pages/auth/EmailResetPassword.spec.ts`

Infra de teste:

- `src/test/setup.ts`
- `src/test/vuetify.ts`

## Audit cautions

Verdades do código atual que costumam ser esquecidas:

- `grava_nois` é um repositório Git separado dentro do workspace do monorepo;
- `ClientProfile.vue` existe, mas não está roteado;
- o portal cliente ainda mistura integração real e fallback mock;
- alguns contratos do frontend estão adiantados em relação à API atual, especialmente no perfil do cliente;
- a store `clips` não representa o fluxo atual de vídeos autenticados;
- `WhatsNewDialog` está presente, mas desligado pelo flag local em `App.vue`.

## Change checklist

Antes de alterar fluxos centrais do frontend, valide:

1. a rota e o guard continuam coerentes com a role esperada;
2. o auth store e o interceptor não introduzem loop de refresh;
3. o envelope HTTP real continua compatível com o service;
4. a UX trata loading, erro e empty state;
5. a mudança exige atualização da spec especializada correspondente;
6. se a task tocar PWA ou chunks dinâmicos, revise também o comportamento de update/reload.
