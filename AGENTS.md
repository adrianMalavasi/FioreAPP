# AGENTS.md — Guia de Continuidade do Projeto App Center PWA

> **REGRA OBRIGATÓRIA PARA AGENTES DE IA:**
> Sempre que iniciar o desenvolvimento ou retomar uma sessão, **leia obrigatoriamente** `AGENTS.md`, `AI_PROGRESS.md` e `AI_TASKS.md`, e verifique o código existente antes de realizar qualquer alteração. Atualize `AI_PROGRESS.md` e `AI_TASKS.md` após cada etapa importante.

---

## 1. Objetivo do Projeto

O **App Center** é uma central de aplicativos PWA (Progressive Web App) simples, moderna, profissional e extremamente fácil de usar, projetada para funcionar em celulares, tablets e computadores como um *launcher* de aplicativos corporativos/autorizados.

O usuário instala o App Center, faz login com e-mail e senha e visualiza apenas os aplicativos que o administrador liberou para ele. Ao tocar no ícone, o aplicativo correspondente é aberto (ou exibe orientações de instalação/acesso, respeitando as limitações dos navegadores para PWAs independentes).

---

## 2. Tecnologias Utilizadas

- **Framework Full-Stack:** Next.js (App Router) com TypeScript
- **Estilização & UI:** Tailwind CSS + componentes estilo `shadcn/ui` + `lucide-react` (suporte a Modo Claro e Escuro)
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma ORM
- **Autenticação:** Sessão segura via JWT (cookies `httpOnly` com `jose` e hash de senha com `bcryptjs`)
- **Validação:** `zod`
- **PWA:** Web App Manifest (`manifest.webmanifest` / `manifest.json`), Service Worker (`public/sw.js`) com fallback para página `/offline`, ícones dedicados e guia de instalação nativo (Android/Desktop `beforeinstallprompt` + instruções iOS Safari).

---

## 3. Estrutura de Pastas

```text
c:\Projetos\FioreApps\
├── AGENTS.md                   # Documentação arquitetural e regras para IAs
├── AI_PROGRESS.md              # Histórico de progresso, arquivos alterados e próximo passo
├── AI_TASKS.md                 # Checklist de tarefas (Pendente / Em andamento / Concluído)
├── prisma/
│   ├── schema.prisma           # Esquema do banco de dados PostgreSQL
│   └── seed.ts                 # Script de seed inicial (perfis Admin/Usuário, admin padrão e apps exemplo)
├── public/
│   ├── sw.js                   # Service Worker do App Center PWA
│   ├── icons/                  # Ícones do próprio App Center PWA (192x192, 512x512, etc.)
│   └── apps/
│       └── icons/              # Ícones dos aplicativos cadastrados (referenciados por iconKey)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/          # Tela de login por e-mail e senha
│   │   ├── (protected)/
│   │   │   ├── page.tsx        # Tela principal "Meus Apps" (Launcher)
│   │   │   └── admin/
│   │   │       ├── users/      # Gestão de Usuários e permissões de aplicativos (checkboxes)
│   │   │       └── apps/       # Gestão de Aplicativos e seleção de iconKey
│   │   ├── api/                # Rotas de API REST / Server Actions
│   │   ├── offline/            # Página offline simples para o PWA
│   │   ├── manifest.ts         # Geração do Web App Manifest
│   │   ├── layout.tsx          # Layout raiz com ThemeProvider e registro do Service Worker
│   │   └── globals.css         # Estilos globais Tailwind CSS
│   ├── components/
│   │   ├── ui/                 # Componentes base reutilizáveis (shadcn/ui)
│   │   ├── layout/             # Header, Sidebar discreta (desktop), ThemeToggle, InstallPrompt
│   │   ├── launcher/           # Grade de apps, Card/Ícone de app, Modal de instruções PWA
│   │   └── admin/              # Formulários e tabelas de Usuários e Aplicativos
│   └── lib/
│       ├── prisma.ts           # Instância singleton do PrismaClient
│       ├── auth.ts             # Funções de sessão JWT, hash de senha e verificação de permissão no servidor
│       ├── app-icons.ts        # Registro oficial de ícones disponíveis em public/apps/icons/
│       ├── validations.ts      # Schemas Zod para validação de formulários e API
│       └── utils.ts            # Utilitários de classe (cn)
```

---

## 4. Banco de Dados (PostgreSQL + Prisma)

Tabelas obrigatórias:

1. **`profiles`**
   - `id` (String / UUID ou CUID, PK)
   - `name` (String, Unique) — ex: `"Administrador"`, `"Usuário"`
   - `isAdmin` (Boolean)

2. **`users`**
   - `id` (String, PK)
   - `name` (String)
   - `email` (String, Unique)
   - `passwordHash` (String)
   - `profileId` (String, FK -> `profiles.id`)
   - `active` (Boolean, default `true`)
   - `createdAt` (DateTime, default `now()`)

3. **`apps`**
   - `id` (String, PK)
   - `name` (String)
   - `description` (String?)
   - `iconKey` (String) — chave que referencia a imagem em `public/apps/icons/<iconKey>.svg` (ou `.png`) registrada em `src/lib/app-icons.ts`
   - `url` (String)
   - `active` (Boolean, default `true`)
   - `displayOrder` (Int, default `0`)

4. **`user_apps`**
   - `id` (String, PK)
   - `userId` (String, FK -> `users.id`, onDelete Cascade)
   - `appId` (String, FK -> `apps.id`, onDelete Cascade)
   - Restrição única: `@@unique([userId, appId])`

---

## 5. Regras de Negócio

1. **Autenticação e Autorização:**
   - Apenas usuários autenticados e com `active = true` podem acessar o sistema.
   - Dois perfis de acesso:
     - **Administrador (`profile.isAdmin = true`):** gerencia usuários, aplicativos e permissões, além de visualizar a tela Meus Apps.
     - **Usuário (`profile.isAdmin = false`):** visualiza e abre **somente** os aplicativos ativos (`app.active = true`) vinculados a ele em `user_apps`.
   - Todas as rotas `/admin/*` e endpoints administrativos verificam `isAdmin` no servidor.
2. **Ícones dos Aplicativos (`iconKey`):**
   - Os arquivos de imagem dos aplicativos ficam em `public/apps/icons/`.
   - O arquivo `src/lib/app-icons.ts` mantém o registro oficial (`APP_ICONS_REGISTRY`) mapeando cada `iconKey` para o caminho em `/apps/icons/<iconKey>.<ext>` e seu rótulo amigável.
   - O painel administrativo permite selecionar apenas chaves válidas presentes nesse registro.
3. **Comportamento de PWA e Abertura de Apps:**
   - Ao clicar no ícone de um aplicativo na tela "Meus Apps", o endereço configurado (`url`) é aberto.
   - Cada aplicativo também oferece uma ação discreta de ajuda/instalação caso o usuário queira adicioná-lo à tela inicial, sem prometer detecção ou instalação automática de PWAs externos.
   - O próprio **App Center** é um PWA completo e instalável.

---

## 6. Padrões de Código

- **Simplicidade e Clareza:** Código limpo, tipagem estrita com TypeScript, sem dependências ou gráficos desnecessários.
- **Design Visual:** Estilo *launcher* inspirado em sistemas móveis modernos (fundo branco/cinza muito claro no modo claro, slate/zinc escuro no modo escuro, ícones grandes com bordas arredondadas `rounded-2xl`, sombras suaves e animações sutis de toque/hover).
- **Segurança:** Validação com `zod` no cliente e no servidor; senhas nunca trafegam ou são retornadas em texto puro ou hash nas respostas de API.

---

## 7. Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Aplicar schema no banco PostgreSQL
npx prisma db push

# Popular dados iniciais (Perfis, Admin padrão e Apps de exemplo)
npm run db:seed

# Rodar servidor de desenvolvimento
npm run dev

# Executar testes e validação de build
npm test
npm run build
```

---

## 8. Como Continuar o Projeto

1. Leia `AI_TASKS.md` para identificar as tarefas `Em andamento` ou `Pendente`.
2. Leia `AI_PROGRESS.md` para entender o último estado salvo, credenciais de seed, configuração do `.env` e o próximo passo exato.
3. Após concluir qualquer etapa, atualize ambos os arquivos imediatamente.

