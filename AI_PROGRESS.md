# AI_PROGRESS.md — Registro de Progresso do Desenvolvimento

## Status Atual
- **Data/Hora da última atualização:** 2026-10-17
- **Etapa atual:** Aplicação configurada para rodar na porta **3009** (`http://localhost:3009`) e ícone oficial (`src/assets/favicon.png`) configurado para exibição no navegador, na interface e ao baixar/instalar o PWA.

## O que foi desenvolvido
1. **Ícones PWA e Favicon Oficial (`public/icons/*`, `src/app/manifest.ts`, `src/app/layout.tsx`):**
   - A partir de `src/assets/favicon.png`, foram gerados ícones PNG redimensionados em alta qualidade em `public/icons/`:
     - `icon-192x192.png` (192x192) e `icon-512x512.png` (512x512) para instalação do PWA no Android/Windows/Desktop via `src/app/manifest.ts`.
     - `apple-touch-icon.png` (180x180) para instalação na Tela de Início do iOS (iPhone/iPad).
     - `favicon-32x32.png` e `favicon-64x64.png` para abas e atalhos do navegador.
   - Atualizados também os logos exibidos em `/login`, na barra superior/lateral (`app-shell.tsx`), no cabeçalho de `Meus Apps` (`app-launcher-grid.tsx`) e no pré-cache do Service Worker (`public/sw.js`).
2. **Fluxo de Primeiro Acesso sem Usuários (`/api/auth/setup` + `src/app/(auth)/login/page.tsx` + `prisma/seed.ts`):**
   - O banco sobe sem nenhum usuário cadastrado (`0` registros em `users`) e solicita o cadastro do primeiro Administrador no primeiro acesso.
3. **Docker + Banco de Dados PostgreSQL (`docker-compose.yml`, `.env`, `prisma/schema.prisma`, `prisma/seed.ts`).**
4. **Sistema de Ícones por Chave (`public/apps/icons/` + `src/lib/app-icons.ts`).**
5. **Tela Principal "Meus Apps", Painel Administrativo (`/admin/users` e `/admin/apps`) e PWA.**

## O que está em andamento
- Tudo concluído e pronto para uso.

## Arquivos Modificados / Criados Recentemente
- `.env` e `package.json` (configurada porta `3009` e `DATABASE_URL` usando `127.0.0.1:5433` para evitar travamento IPv6 `::1` do `wslrelay` no Windows)
- `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`, `public/icons/apple-touch-icon.png`, `public/icons/favicon-64x64.png`, `public/icons/favicon-32x32.png` (criados a partir de `src/assets/favicon.png`)
- `src/app/manifest.ts` (atualizado para os novos ícones PNG 192x192 e 512x512)
- `src/app/layout.tsx` (atualizado com `icon`, `shortcut` e `apple` apontando para os novos PNGs)
- `public/sw.js` (atualizado cache para `v2` com os novos ícones)
- `src/app/(auth)/login/page.tsx`, `src/components/layout/app-shell.tsx`, `src/components/launcher/app-launcher-grid.tsx` (logo atualizado)

## Testes Executados
- Geração dos ícones PNG nas resoluções exigidas pelo Web App Manifest (`192x192`, `512x512`, `180x180`, `64x64`, `32x32`).
