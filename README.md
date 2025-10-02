# SportClips - Plataforma de Download de Vídeos Esportivos

Uma plataforma completa para visualizar, comprar e baixar vídeos de lances esportivos com interface moderna e responsiva.

## 🚀 Tecnologias

- **Vue 3** com Composition API e TypeScript
- **Vuetify 3** para componentes e tema
- **Vue Router 4** para roteamento
- **Pinia** para gerenciamento de estado
- **Bootstrap 5** (utilities apenas) para classes utilitárias
- **Vite** como build tool
- **Material Design Icons** para iconografia

## 🎨 Design System

### Paleta de Cores
- **Primária**: `#1B5E20` (Verde esporte)
- **Secundária**: `#F57C00` (Laranja)  
- **Atenção**: `#D32F2F` (Vermelho)
- **Sistema de espaçamento**: 8px base

### Temas
- Dark theme por padrão
- Light theme disponível via toggle
- Cores configuráveis via CSS variables

## 📱 Funcionalidades

### Autenticação
- Login com email/senha (qualquer combinação funciona no mock)
- Modo demonstração sem necessidade de cadastro
- Proteção de rotas autenticadas

### Navegação Principal
- `/meus-lances` - Lista de vídeos com filtros avançados
- `/lance/:id` - Player de vídeo com detalhes e metadados
- `/downloads` - Gerenciamento de downloads
- `/suporte` - FAQ e central de ajuda

### Recursos Avançados
- **Filtros**: Por esporte, data, status e busca textual
- **Sistema de Compra**: Modal de checkout com cartão simulado
- **Downloads**: Progresso em tempo real com pause/resume
- **Player de Vídeo**: Controles nativos com poster
- **Estados**: Loading skeletons, empty states, error handling
- **Notificações**: Sistema de snackbar para feedback

## 🛠️ Comandos

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── AppShell.vue    # Layout principal
│   ├── ClipCard.vue    # Card de vídeo
│   ├── ClipFilters.vue # Filtros avançados
│   └── ...
├── pages/              # Páginas da aplicação
├── layouts/            # Layouts
├── store/              # Estados Pinia
├── router/             # Configuração de rotas
├── utils/              # Utilitários e formatters
├── styles/             # CSS variables e utilities
├── composables/        # Composables Vue
└── plugins/            # Configuração Vuetify
```

## 🎯 Componentes Principais

### ClipCard
Card responsivo com thumbnail, badges, preço e CTA de compra/download.

### ClipFilters  
Sistema de filtros com chips de esporte, date picker, select de status e busca.

### DownloadButton
Botão inteligente que muda de estado: Comprar → Baixar → Progresso → Concluído.

### CheckoutMock
Modal de pagamento simulado com validação de cartão de crédito.

## 📦 Estados de Dados

### useClipsStore
- Lista de vídeos mock com diferentes esportes
- Filtros reativos
- Simulação de compra e download
- Estados de progresso e conclusão

### useAuthStore  
- Autenticação mock
- Modo demonstração
- Proteção de rotas

### useThemeStore
- Toggle dark/light theme
- Integração com Vuetify theme

## 🌐 Responsividade

- **Mobile**: Lista vertical, bottom navigation
- **Tablet**: Grid 2 colunas, drawer temporário  
- **Desktop**: Grid 3-4 colunas, sidebar fixa

## ⚡ Performance

- Lazy loading de páginas
- Componentes otimizados
- Imagens com placeholder
- Estados de loading apropriados

## 🔧 Personalização

### Alterar Paleta de Cores
Edite as CSS variables em `src/styles/variables.css`:

```css
:root {
  --primary-color: #1B5E20;    /* Verde esporte */
  --secondary-color: #F57C00;   /* Laranja */
  --accent-color: #D32F2F;      /* Vermelho */
}
```

### Configurar Vuetify
Ajuste temas e configurações em `src/plugins/vuetify.ts`.

### Bootstrap Utilities
Apenas utilities são importadas em `src/styles/utilities.scss` para evitar conflitos com Vuetify.

## 📱 Acessibilidade

- Navegação por teclado completa
- Contraste AA em todos os temas
- ARIA labels em componentes interativos
- Focus indicators visíveis
- Estrutura semântica HTML

## 🚀 Deploy

O projeto está otimizado para deploy em qualquer provedor de hospedagem estática (Netlify, Vercel, GitHub Pages, etc.).

---

**Desenvolvido com Vue 3 + Vuetify 3 + TypeScript**