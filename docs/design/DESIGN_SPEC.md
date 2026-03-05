# FRONTEND DESIGN SPEC — Grava Nóis (Somente Frontend)
---
Status: Active
Last update: 2026-03-02
Scope: `grava_nois` (frontend web/pwa)
---


## 1) Objetivo

O frontend do Grava Nóis entrega uma experiência Web/PWA para:

* autenticação e sessão do usuário;
* navegação por replays/clips;
* preview e download (via URLs fornecidas pela API);
* painéis por papel (admin / cliente / usuário final);
* feedback consistente (loading, erros, vazios);
* usabilidade em mobile (PWA).

**Fora do escopo do frontend:** ingestão/captura, validação de integridade no storage, fila/mensageria, webhooks de billing, HMAC de device, deploy/observabilidade do backend.

---

## 2) Stack e dependências

* **Vue 3** (Composition API)
* **TypeScript**
* **Vite**
* **Pinia** (state management)
* **Vue Router**
* **Vuetify** (componentes base)
* **Tailwind** (layout/utilitários)
* **Axios** com `withCredentials: true`
* **Notivue** (toasts/alerts)
* **PWA** (Vite PWA plugin)

---

## 3) Arquitetura do frontend

### 3.1 Estrutura de pastas (referência)

```
src/
  assets/
  components/
  composables/
  layouts/
  pages/
  router/
  services/
  stores/
  types/
  utils/
```

### 3.2 Camadas e responsabilidades

* **Pages**: orquestram fluxo da tela (carregamento, filtros, paginação), chamam services e alimentam stores.
* **Components**: UI reutilizável, sem regras de domínio (recebem props / emitem events).
* **Stores (Pinia)**: estado global (sessão, perfil, permissões, preferências e caches leves).
* **Services**: integração HTTP com a API (DTOs, mapeamento de erros, retries controlados).
* **Composables**: lógica reutilizável de tela (paginação, debounces, formulários, uploads UX).
* **Types**: contratos TypeScript (DTOs de request/response, enums e modelos de view).

---

## 4) Sessão e autenticação (no frontend)

### 4.1 Princípios

* O frontend **não** armazena tokens sensíveis em `localStorage`.
* A sessão é mantida via cookies HttpOnly (comportamento dependente do backend), e o frontend atua via `withCredentials`.

### 4.2 Boot de sessão

No `App` / `router` init:

* tentar carregar `me`/perfil;
* resolver estado inicial: `unknown → authenticated | unauthenticated`;
* bloquear rotas protegidas enquanto o estado estiver `unknown`.

### 4.3 Tratamento de 401 (expiração de sessão)

Padrão recomendado no Axios:

* Interceptor identifica 401.
* Tenta **1** refresh (se existir endpoint/fluxo).
* Fila requisições concorrentes durante refresh.
* Se refresh falhar: limpar estado local e redirecionar para login.

> **Nota:** detalhes do endpoint de refresh pertencem ao documento de contrato da API, não aqui.

---

## 5) Autorização e RBAC no frontend

### 5.1 Objetivo

* Evitar navegação indevida (UX).
* O frontend **não substitui** a autorização do backend.

### 5.2 Modelo

* O store de sessão expõe `roles/scopes` do usuário.
* Router guards:

  * rotas públicas
  * rotas autenticadas
  * rotas por role (ex.: `admin`, `client`)

### 5.3 UX de bloqueio

* Se não autenticado: redirect para `/login`.
* Se autenticado mas sem permissão: página 403 (ou redirect para dashboard permitido) + toast.

---

## 6) Padrões de UI/UX

### 6.1 Estados obrigatórios por tela

Toda page deve tratar explicitamente:

* **loading inicial** (skeleton quando lista/tabela; spinner quando ação curta)
* **empty state** (mensagem + CTA)
* **error state** (mensagem clara + ação de retry)
* **partial state** (ex.: lista carregada, mas ação falhou)

### 6.2 Notificações (Notivue)

* `success`: ação concluída
* `warning`: validação/negócio
* `error`: falha de rede/servidor
* `info`: eventos neutros

Padrões:

* Mensagens curtas.
* Se erro tiver `code`, mapear para mensagens amigáveis.

### 6.3 Formulários

* Regras de validação no nível de UI (campos obrigatórios, formato).
* Mensagens próximas ao campo.
* Submissão com estado de `submitting` e botão desabilitado.

### 6.4 Paginação, filtros e busca

* Paginação server-driven (quando aplicável), com:

  * `page`, `pageSize`, `total`
* Busca com debounce (300–500ms).
* Filtros persistidos opcionalmente (ex.: em querystring).

---

## 7) Fluxos de tela (alto nível)

### 7.1 Login

* Email/senha (se disponível) e/ou OAuth (se disponível).
* Pós-login: redirecionar para dashboard conforme role.

### 7.2 Listagem de vídeos/replays

* Tabela/lista com:

  * data/hora
  * duração
  * venue
  * ações: preview / download
* Filtros: período, venue, status (se aplicável).

### 7.3 Preview

* Solicitar URL de playback **sob demanda**.
* Se URL expirar: solicitar novamente e repetir ação.
* Player:

  * controles básicos
  * fallback de erro (não reproduziu / rede)

### 7.4 Download

* Solicitar URL de download sob demanda.
* Acompanhar UX (loading + sucesso/erro).
* Se expirou: re-solicitar e continuar.

---

## 8) PWA

### 8.1 Objetivos

* Instalação em mobile.
* Melhor experiência offline limitada (somente shell, não mídia).

### 8.2 Estratégia recomendada

* Cache do **app shell** (JS/CSS/assets).
* **Não** cachear arquivos de vídeo.
* Prompt de update quando nova versão do Service Worker estiver pronta.

---

## 9) Convenções de integração HTTP (services)

### 9.1 Padrões

* Cada service encapsula endpoints de um módulo (ex.: `videosService`, `authService`).
* DTOs tipados em `src/types`.

### 9.2 Erros

* Padronizar um `ApiError` com:

  * `status`
  * `code`
  * `message`
  * `details`
* Mapear para UX:

  * 401 → fluxo de sessão
  * 403 → tela/aviso de permissão
  * 404 → vazio ou erro específico
  * 429 → “muitas tentativas, aguarde”
  * 5xx → erro genérico + retry

---

## 10) Checklist de qualidade (Definition of Done do Front)

* [ ] Estados: loading/empty/error/partial implementados.
* [ ] Tipos TS para requests/responses.
* [ ] Guards de rota coerentes com roles.
* [ ] Interceptor 401 correto (sem loop).
* [ ] Feedback de UX (toasts e disabled states).
* [ ] PWA: update prompt e cache shell.
* [ ] Sem lógica de domínio/infra dentro do front.

---

## 11) Apêndice — Itens que devem estar em outros documentos

Se precisar documentar estes temas, crie docs separados:

* **API_CONTRACT.md** (endpoints, payloads, TTLs, erros)
* **SYSTEM_ARCHITECTURE.md** (visão macro de componentes)
* **EDGE_DEVICE_SPEC.md** (captura, fila local, GPIO)
* **SECURITY_OVERVIEW.md** (ameaças e controles)
