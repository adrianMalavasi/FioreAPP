# AI_TASKS.md — Controle de Tarefas do Projeto App Center PWA

> Estados permitidos: **Pendente** | **Em andamento** | **Concluído**

| # | Etapa / Tarefa | Estado | Observações |
|---|----------------|--------|-------------|
| 0 | Criar arquivos de documentação para continuidade (`AGENTS.md`, `AI_PROGRESS.md`, `AI_TASKS.md`) | **Concluído** | Documentação inicial e regras de continuidade criadas na raiz do projeto. |
| 1 | Estrutura do projeto (Next.js + TypeScript + Tailwind + shadcn/ui) e Banco de Dados (Prisma + PostgreSQL) | **Concluído** | Schema Prisma (`users`, `profiles`, `apps`, `user_apps`), ícones em `public/apps/icons/<iconKey>.svg`, registro `src/lib/app-icons.ts` e `prisma/seed.ts`. |
| 2 | Login e autenticação segura (JWT + Cookies HttpOnly + Proteção de rotas e permissões no servidor) | **Concluído** | Implementado em `src/lib/jwt.ts`, `src/lib/auth.ts`, `src/middleware.ts`, `/api/auth/login`, `/api/auth/logout` e `/login`. |
| 3 | Cadastro e gerenciamento de usuários (`/admin/users`) | **Concluído** | Cadastrar, editar, ativar/desativar, escolher perfil (`Administrador` ou `Usuário`) em `/admin/users`. |
| 4 | Cadastro e gerenciamento de aplicativos (`/admin/apps`) | **Concluído** | Cadastrar, editar, excluir com confirmação, selecionar `iconKey` de `public/apps/icons/`, ativar/desativar em `/admin/apps`. |
| 5 | Permissões de aplicativos por usuário (`user_apps`) | **Concluído** | Lista de aplicativos com checkboxes e ícones integrada no modal de cadastro/edição de usuário. |
| 6 | Tela principal "Meus Apps" (Launcher responsivo + Modo Claro/Escuro) | **Concluído** | Logo App Center, saudação simples, busca instantânea, grade estilo smartphone/desktop e modal de ajuda/instalação. |
| 7 | Configuração PWA completa (Manifest, Service Worker, Ícones, Página Offline, Botão Instalar) | **Concluído** | `src/app/manifest.ts`, `public/sw.js`, `src/app/offline/page.tsx` e `src/components/layout/pwa-install-banner.tsx`. |
| 8 | Testes dos fluxos principais e ajustes finais de qualidade | **Concluído** | Suíte de testes Vitest (`src/__tests__/core-flows.test.ts`) com 8 testes passando e build validado. |

