# Grava Nóis – Plataforma Web de Replays Esportivos

Versão: 1.1.0

## Visão geral
O **Grava Nóis** é um ecossistema de captura e distribuição de replays esportivos para quadras e campos amadores. Um dispositivo local grava continuamente o jogo e, quando um atleta aciona o botão físico, o sistema recorta um trecho (antes/depois do evento), monta o clipe e envia para a nuvem. Esta aplicação web/PWA consome a API do Grava Nóis para autenticação, listagem e entrega dos vídeos.

## O que este repositório entrega
- Web app e PWA para atletas e administradores.
- Login por email/senha e Google (OAuth via Google Identity Services).
- Listagem de clipes por quadra com paginação, prévia sob demanda e download com URLs assinadas.
- Área administrativa com dashboard e gestão de usuários, clientes e quadras.
- Páginas de suporte: relatório de erro e solicitação de instalação.
- Notificações globais e UI responsiva com Vuetify + utilitários Tailwind.

## Stack principal
- Vue 3 + TypeScript
- Vite + `vite-plugin-pwa`
- Vuetify 3 + Tailwind CSS
- Pinia (estado)
- Axios (HTTP)
- Notivue (notificações)

## Fluxo de alto nível
1. Dispositivo local grava continuamente o jogo.
2. Atleta aciona o botão e o sistema gera o clipe.
3. O clipe é enviado para storage (ex.: S3) e a API registra metadados.
4. A web app lista os clipes e solicita URLs assinadas para preview/download.

## Configuração do ambiente
Crie um arquivo `.env` (ou `.env.local`) na raiz:

```dotenv
VITE_API_BASE=https://api.gravanois.com
VITE_GOOGLE_CLIENT_ID=<google_oauth_client_id>
VITE_MAINTENANCE_MODE=false
```

- `VITE_API_BASE`: base da API. Necessário para autenticação, listagem de vídeos e endpoints administrativos. A API usa cookies (`withCredentials`).
- `VITE_GOOGLE_CLIENT_ID`: usado no login Google.
- `VITE_MAINTENANCE_MODE`: se `true`, `1`, `on` ou `yes`, força o redirecionamento para `/maintenance`.

## Scripts
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Rotas principais
- `/` Home
- `/lances-gravanois` Listagem de vídeos (requer login)
- `/login` e `/register` Autenticação
- `/auth/callback` Callback OAuth
- `/user-page` Perfil
- `/contato` Solicitação de instalação
- `/reportar-erro` Relatório de erro
- `/admin/*` Área administrativa (requer `role=admin`)
- `/maintenance` Modo manutenção

## Integração com API
Principais endpoints consumidos pela aplicação:
- `GET /auth/me`, `POST /auth/sign-in`, `POST /auth/sign-up`, `POST /auth/sign-out`, `POST /auth/google`, `POST /auth/refresh`
- `GET /api/videos/list` (paginação por `nextToken`)
- `GET /api/videos/sign` (URLs assinadas para `preview` e `download`)
- `GET /admin/dashboard`, `GET /admin/users`, `GET /admin/clients`, `GET /admin/venues`
- `PATCH /admin/users/:id`, `PATCH /admin/clients/:id`
- `POST /notifications/report` e `POST /notifications/contact`

Observação: os serviços de relatório e solicitação de instalação usam `X-Skip-Auth` para não exigir sessão.

### Padrão de resposta (Envelope)
A API adota o formato padrão abaixo:

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

Regras implementadas no frontend:
- Tipar as chamadas com `ApiResponse<T>` (ex.: `api.get<ApiResponse<User[]>>()`).
- Extrair o payload real com `response.data.data`.
- Em endpoints paginados, considerar também `response.data.meta` para `page`, `limit` e `total`.
- No interceptor de erro, priorizar `response.data.message` e fallback para `response.data.error.code`, expondo a mensagem amigável em `error.message`.
- A estratégia de autenticação com cookies HttpOnly (`withCredentials`) permanece inalterada.

## PWA
- Registro automático de Service Worker com atualização.
- Cache de imagens e fontes via Workbox.
- Prompt de instalação customizado e alerta de atualização.

## Estrutura de pastas
```
src/
├── assets/             # Logos, imagens e ícones
├── components/         # Componentes reutilizáveis
├── components/home-sections/ # Seções da home
├── components/videos/  # Cards e views de vídeos
├── layouts/            # Layouts globais (App/Admin)
├── pages/              # Páginas (home, auth, vídeos, admin, suporte)
├── router/             # Rotas e guards
├── services/           # Integrações HTTP e API
├── store/              # Pinia stores
├── styles/             # Variáveis e utilitários
├── utils/              # Helpers e ícones
└── config/             # Configs locais
```

## Versionamento
- Seguimos SemVer (`MAJOR.MINOR.PATCH`).
- Versão atual: `1.1.0`.
- Histórico de mudanças em `CHANGELOG.md`.

## Licença
MIT.
