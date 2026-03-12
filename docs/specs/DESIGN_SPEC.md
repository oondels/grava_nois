# DESIGN_SPEC

## 1. Overview

`grava_nois` é o frontend web/PWA do ecossistema Grava Nóis. Esta spec é a entrada principal para lookup por code agents e auditoria técnica.

Objetivo desta estrutura:

- reduzir leitura desnecessária de código;
- guiar lookup seletivo por domínio;
- concentrar navegação para rotas, arquitetura, integrações e regras de UI.

## 2. Spec Navigation

Use este arquivo como índice. Para detalhes, abra apenas a spec relevante para a task.

- Frontend lookup: [docs/specs/frontend/README.md](./frontend/README.md)
- Arquitetura, shell e sessão: [docs/specs/frontend/ARCHITECTURE.md](./frontend/ARCHITECTURE.md)
- Rotas e áreas de tela: [docs/specs/frontend/ROUTES.md](./frontend/ROUTES.md)
- Regras de UI, auth e comportamento: [docs/specs/frontend/BUSINESS_RULES.md](./frontend/BUSINESS_RULES.md)
- Integrações HTTP, PWA e dependências: [docs/specs/frontend/INTEGRATIONS.md](./frontend/INTEGRATIONS.md)
- Operação, testes e cautelas: [docs/specs/frontend/OPERATIONS.md](./frontend/OPERATIONS.md)

## 3. Suggested Reading Order

Para manutenção geral:

1. [docs/specs/frontend/README.md](./frontend/README.md)
2. [docs/specs/frontend/ARCHITECTURE.md](./frontend/ARCHITECTURE.md)
3. A spec especializada da área impactada

Para tasks por assunto:

- login, sessão, guards, refresh: [docs/specs/frontend/BUSINESS_RULES.md](./frontend/BUSINESS_RULES.md) e [docs/specs/frontend/INTEGRATIONS.md](./frontend/INTEGRATIONS.md)
- páginas, layouts, navegação, RBAC: [docs/specs/frontend/ROUTES.md](./frontend/ROUTES.md) e [docs/specs/frontend/ARCHITECTURE.md](./frontend/ARCHITECTURE.md)
- vídeos, download, previews: [docs/specs/frontend/ROUTES.md](./frontend/ROUTES.md), [docs/specs/frontend/BUSINESS_RULES.md](./frontend/BUSINESS_RULES.md), [docs/specs/frontend/INTEGRATIONS.md](./frontend/INTEGRATIONS.md)
- admin e portal cliente: [docs/specs/frontend/ROUTES.md](./frontend/ROUTES.md) e [docs/specs/frontend/INTEGRATIONS.md](./frontend/INTEGRATIONS.md)
- PWA, service worker, build, testes: [docs/specs/frontend/INTEGRATIONS.md](./frontend/INTEGRATIONS.md) e [docs/specs/frontend/OPERATIONS.md](./frontend/OPERATIONS.md)

## 4. Source-of-Truth Rule

As specs são lookup e compressão de contexto. A fonte de verdade final continua sendo:

1. código fonte;
2. testes;
3. estas specs.

Quando houver divergência, a spec deve ser atualizada para refletir o comportamento real do app.
