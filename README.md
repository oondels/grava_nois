# Grava Nóis – Plataforma de Replays Esportivos

O **Grava Nóis** é um ecossistema de captura e distribuição de replays esportivos pensado para quadras e campos amadores. O hardware instalado na quadra registra continuamente a partida; quando um atleta aciona o botão físico no local, o sistema recorta automaticamente os **25 segundos anteriores** e os **10 segundos posteriores** ao acionamento, concatena o trecho e envia o clipe final para armazenamento em nuvem (Amazon S3). Esses vídeos ficam imediatamente disponíveis para visualização e download pelos atletas no aplicativo web/PWA descrito neste repositório.

## Como o fluxo funciona

1. **Captura local** – Um dispositivo dedicado permanece gravando o jogo e monitora o botão físico da quadra.
2. **Gatilho do atleta** – Ao identificar um lance marcante, o atleta pressiona o botão. O dispositivo separa o intervalo configurado (25s anteriores + 10s posteriores) e monta o clipe final.
3. **Envio para a nuvem** – O clipe é processado e enviado automaticamente para um bucket S3. Metadados de identificação (quadra, atleta/time, timestamp) são registrados na API do Grava Nóis.
4. **Disponibilização** – A API notifica a plataforma web/mobile, que lista os novos vídeos, disponibiliza URLs assinadas para preview e download e gerencia o acesso de cada usuário autenticado.

## Aplicação Web (este repositório)

Este projeto entrega a experiência web/PWA consumida por atletas e administradores:

- Autenticação via **API do Grava Nóis** (email/senha e login social via Google).
- Dashboard de vídeos por quadra, com paginação, preview sob demanda e download com URLs temporárias.
- Notificações globais via [Notivue](https://vue-notification.netlify.app/).
- Layout responsivo com **Vuetify 3**, Tailwind utilities e design focado em tema escuro.
- Suporte a PWA (instalação, cache offline básico, prompts de atualização).
- Integração com endpoints REST do backend (`/api/videos/list` e `/api/videos/sign`) para listar e assinar clipes.

>  O conteúdo de mock na `useClipsStore` serve apenas para prototipagem offline; em produção, a listagem provém da API e dos arquivos gerados pelo sistema de captura.

## 🏗️ Tecnologias principais

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) + `vite-plugin-pwa`
- [Vuetify 3](https://vuetifyjs.com/) e [Tailwind CSS](https://tailwindcss.com/) (classes utilitárias)
- [Pinia](https://pinia.vuejs.org/) para gerenciamento de estado
- [Axios](https://axios-http.com/) para chamadas HTTP

## Configuração do ambiente

Crie um arquivo `.env` (ou `.env.local`) na raiz com as variáveis necessárias para build e execução:

```dotenv
VITE_API_BASE=https://api.gravanois.com
VITE_GOOGLE_CLIENT_ID=<google_oauth_client_id>
```

- `VITE_API_BASE` aponta para a API que expõe as rotas de vídeos (`/api/videos/list`, `/api/videos/sign`) e serviços auxiliares (`/send-report`, `/send-email`).
- `VITE_GOOGLE_CLIENT_ID` é usado para renderizar o botão de login Google (Google Identity Services).

> Em ambiente de desenvolvimento, caso a API ainda não esteja disponível, defina `VITE_API_BASE` para um mock server local ou utilize os dados mockados da store.

## 🖥️ Scripts

```bash
# Instalar dependências
default npm install

# Rodar em modo desenvolvimento com HMR
npm run dev

# Gerar build de produção
npm run build

# Servir a build para verificação
npm run preview
```

## 🗂️ Estrutura resumida

```
src/
├── assets/             # Logos, imagens e ícones
├── components/         # Componentes Vue reutilizáveis (AppShell, VideoCard, prompts PWA…)
├── layouts/            # Layouts globais
├── pages/              # Páginas da aplicação (Home, Login, Videos, etc.)
├── router/             # Rotas e guards de autenticação
├── services/           # Chamadas HTTP (reportes, instalação, vídeos)
├── store/              # Pinia stores (auth, clips mock, tema)
├── utils/              # Utilitários (formatters, loaders, ícones)
└── config/             # Configs do app (ex.: base URL)
```

## 🔐 Fluxo de autenticação

1. O store `auth` consulta a sessão atual via API (`GET /auth/me`) usando cookies (`withCredentials`).
2. Login por email/senha usa `POST /auth/sign-in`; cadastro usa `POST /auth/sign-up`; logout usa `POST /auth/sign-out`.
3. Login com Google usa Google Identity Services para obter o `credential` (ID token) e envia para `POST /auth/google`.
4. Guardas de rota asseguram que páginas como `/lances-gravanois` sejam acessadas apenas após login.

## 🌐 Integração com vídeos

- A página `VideosPage.vue` carrega os dados do usuário autenticado e suas quadras vinculadas.
- Ao selecionar uma quadra (`VideoPageQuadra.vue`), a app usa `VITE_API_BASE` para buscar a lista paginada de clipes.
- A prévia (preview) é carregada apenas sob demanda, através de URLs assinadas (`/api/videos/sign?kind=preview`). Downloads utilizam o mesmo endpoint com `kind=download`.
- A aplicação armazena o último local escolhido em `localStorage` (`grn-last-quadra-id`) para agilizar o acesso do usuário em revisitas.

## 📲 PWA

- Prompt personalizado para instalação (`InstallPrompt.vue`) com suporte a Android/Web e instruções específicas para iOS.
- Componente `ReloadPrompt` monitora atualizações de Service Worker e oferece botão de “Atualizar”.
- Configuração do `VitePWA` inclui cache para imagens, fontes e fallbacks padrão de SPA.

## 🛠️ Futuro e próximos passos

- Conectar a listagem mockada ao pipeline completo de ingestão, incluindo metadados de atletas e eventos.
- Disponibilizar comandos e documentação para o dispositivo de captura (edge device) e para o backend que recebe os vídeos.
- Adicionar testes automatizados (unitários/E2E) e checklist de deploy.
- Revisar estilos compartilhados e consolidar o design system entre Vuetify e Tailwind.

---

Para dúvidas ou sugestões, abra uma issue ou entre em contato com a equipe Grava Nóis.
