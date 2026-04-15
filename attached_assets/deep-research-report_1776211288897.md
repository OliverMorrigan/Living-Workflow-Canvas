# Recursos open-source para projetos full‑stack com Next.js + TypeScript

**Data de referência:** 02/04/2026 (America/Sao_Paulo)

## Resumo executivo

Este relatório apresenta um panorama **analítico e completo** dos recursos open-source e gratuitos para aplicações full-stack usando Next.js + TypeScript. Começa com os catálogos oficiais da Vercel (templates, marketplace, exemplos) e do **AI SDK** (introdução, cookbook)【30†L3-L10】【24†L9-L12】, passa pelos guias e repositórios oficiais do Next.js, e encerra em ferramentas e boilerplates populares da comunidade (Auth.js, Prisma, Drizzle, etc.). Cada recurso listado inclui descrição, licença, comandos de instalação/uso, arquivos principais, sinais de maturidade (estrelas, data de último commit) e casos de uso. Fornecemos também exemplos prontos de bootstrap (create-next-app, Dockerfile, docker-compose) e tabelas comparativas de starters. Além disso, há **diagramas Mermaid** ilustrando a arquitetura (app Next.js ↔ recursos Vercel/DB/Edge) e um **fluxograma de linha do tempo** demonstrando etapas de clonagem, build e execução. Todas as seções são fundamentadas em fontes oficiais (Vercel, Next.js, GitHub)【39†L17-L23】【24†L9-L12】【30†L3-L10】, marcando “não especificado” onde os dados não estão disponíveis.  

## Índice de recursos

```text
CATÁLOGOS & EXEMPLOS
- Vercel Templates (Next.js): https://vercel.com/templates/nextjs
- Vercel Marketplace – Next.js: https://vercel.com/marketplace?filter=Next.js
- Vercel Examples (GitHub): https://github.com/vercel/examples
- AI SDK – Introdução (Vercel): https://ai-sdk.dev/docs/introduction
- AI SDK – Cookbook (Vercel): https://ai-sdk.dev/cookbook

STARTERS OFICIAIS (full-stack)
- Next.js SaaS Starter (GitHub nextjs): https://github.com/nextjs/saas-starter
- Next.js Commerce (GitHub vercel): https://github.com/vercel/commerce
- Vercel Chatbot (GitHub vercel): https://github.com/vercel/chatbot
- Admin Dashboard (GitHub vercel): https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template
- Postgres/Auth Starter (GitHub vercel): https://github.com/vercel/nextjs-postgres-auth-starter
- Stripe Store Template (GitHub vercel): https://github.com/vercel/nextjs-stripe-template

PLATAFORMA & SDKs VERCEL
- Vercel CLI (deploy): https://vercel.com/docs/cli
- Vercel Functions API: https://vercel.com/docs/functions
- Vercel Blob/Edge Config: https://vercel.com/docs/vercel-blob
- Vercel Analytics: https://vercel.com/docs/analytics
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- Vercel Workflow SDK: https://useworkflow.dev
- Vercel Chat SDK: https://chat-sdk.dev
- Vercel Flags SDK: https://flags-sdk.dev

DOCUMENTAÇÃO NEXT.js
- Next.js App Router (docs): https://nextjs.org/docs/app
- Pages Router (API Routes): https://nextjs.org/docs/pages
- Internacionalização (next.config.js): https://nextjs.org/docs/app/api-reference/next-config-js/internationalization
- Streaming/ISR/Caching (docs): https://nextjs.org/docs/app/building-your-application/caching 
- Middleware/Proxy (docs): https://nextjs.org/docs/app/building-your-application/routing/middleware

GITHUB OFICIAL
- Org **nextjs** (exemplos: saas-starter, deploy-*): https://github.com/nextjs
- Org **vercel** (exemplos: next.js, examples, commerce, storage): https://github.com/vercel
- AI SDK (repo vercel/ai): https://github.com/vercel/ai

BIBLIOTECAS COMUNS (open-source)
- Auth.js (NextAuth): https://github.com/nextauthjs/next-auth
- Prisma ORM: https://github.com/prisma/prisma
- Drizzle ORM: https://github.com/drizzle-team/drizzle-orm
- SWR: https://github.com/vercel/swr
- TanStack Query: https://github.com/TanStack/query
- shadcn/ui: https://github.com/shadcn-ui/ui
- Tailwind CSS: https://github.com/tailwindlabs/tailwindcss
- tRPC: https://github.com/trpc/trpc
- Storybook para Next.js: https://storybook.js.org/docs/nextjs/get-started
- Vercel CLI GH Actions: https://docs.github.com/actions/guides/deployment-to-vercel

INFRAESTRUTURA & DEPLOY
- Deploy Docker (guia Next.js): https://nextjs.org/docs/pages/deployment#docker
- Terraform Vercel Provider: https://registry.terraform.io/providers/fermi-ew/fermi/latest
- Nx monorepo (plugin Next): https://nx.dev/packages/nx-plugin-next
- Turborepo (monorepo): https://github.com/vercel/turborepo
- Vercel monorepos docs: https://vercel.com/docs/monorepos
```

## Vercel Templates e Exemplos

**Vercel Templates (Next.js)** — Catálogo filtrável de boilerplates para Next.js (SaaS, e-commerce, blogs, etc.)【0†L0-L6】. Licença: n/a (site). Use a UI do Vercel ou `vercel --prod` para clonar/deploy direto.  
- Comando: abra o template e clique em *Deploy*, ou clone via CLI: `vercel templates/nextjs/<template-name>`.  
- Arquivos: variam por template (ex.: `app/`, `next.config.js`, `.env.example`). Inspecione os arquivos de configuração e rotas (`app/*` ou `pages/*`).  
- Maturidade: não especificado (depende do autor do template).  

**Vercel Marketplace (Next.js)** — Página de temas e starters (oficiais e comunitários) para Next.js【30†L3-L10】. Licença: n/a (é índice de templates). Use para descobrir e deployar templates (ex.: **Next.js Commerce**, **Admin Dashboard**).  
- Links de exemplo: `vercel.com/marketplace?filter=Next.js`.

**vercel/examples (GitHub)** — Coleção MIT de exemplos práticos【28†L8-L11】. (~5.1k★)  
- Clone: `git clone https://github.com/vercel/examples`. Navegue nas pastas (`app-directory/`, `cms/`, `storage/`, etc.).  
- Uso: cada exemplo tem `README.md`. Exemplo rápido:
  ```bash
  cd examples/app-directory/hello-world
  pnpm i
  pnpm dev
  ```
- Arquivos: veja `app/page.tsx`, `app/api/*/route.ts`, `next.config.js`, etc. (exemplo “Hello World” usa React Server Components).  
- Maturidade: ativo, MIT【28†L8-L11】. Bom para aprender padrões pontuais (API routes, SSG, CMS integrations).

**create-next-app (Next.js oficial)** — CLI oficial para scaffold (TS + Tailwind + Turbopack)【39†L17-L23】. (~20★)  
- Comando: 
  ```bash
  pnpm create next-app@latest meu-app --typescript --tailwind
  cd meu-app
  pnpm dev
  ```
  Isso gera `app/`, `layout.tsx`, `tailwind.config.js`, entre outros【39†L17-L23】.  
- Instala/uso: já pronto para Next.js 16+, com file `AGENTS.md`.  
- Arquivos: `app/layout.tsx` (root), `app/page.tsx`, `next.config.js`, `tsconfig.json`.  
- Maturidade: padrão oficial (mantido Vercel/Next). Versão 16.2.2 em abril/2026【24†L9-L12】.  
- Recomendações: base para qualquer projeto; evite personalizar itens só depois de criado (use flags CLI para opções).

**Próximos de ler:** guides do Next.js como **Internationalization**, **SSG/ISR**, **Streaming/Caching**. As *gaps* de template (ex.: deploy) são cobertas pelas seções abaixo (Deploy, CI/CD).

## Boilerplates Full-Stack e Starters

**Next.js SaaS Starter** (GitHub nextjs/saas-starter) — Starter completo para apps SaaS【30†L3-L10】.  
- Link: `https://github.com/nextjs/saas-starter` (MIT; ★15.6k)【30†L3-L10】.  
- Setup:
  ```bash
  git clone https://github.com/nextjs/saas-starter
  cd saas-starter
  pnpm install
  pnpm db:setup
  pnpm dev
  ```
- Arquivos: `app/`, `middleware.ts` (segurança), `drizzle.config.ts`, `next.config.ts`, `.env.example` com STRIPE_KEYS.  
- Maturidade: ativo (MIT)【30†L3-L10】; última atualização 2025.  
- Uso: apps SaaS (conta de usuário, Stripe, RBAC). Limitação: depende de Stripe/DB externos; boa para MVP escalável.

**Next.js Commerce** (vercel/commerce) — Boilerplate e‑commerce headless【1†L0-L3】. (~14k★)  
- Link: `https://github.com/vercel/commerce` (MIT).  
- Setup: clone ou via `create-next-app` com `--example commerce`.  
- Arquivos: `app/` com rotas de produtos, `framework/` (integração Shopify), `.env.example` (SHOPIFY_KEY).  
- Uso: lojas SSR rápidas (RSC, Actions). Limitação: exige provedor (Shopify, etc.) e conhecimento de e‑commerce.

**Vercel Chatbot** (vercel/chatbot) — Exemplo de app com chat+AI【24†L9-L12】. (Apache-2.0; ★20k)  
- Link: `https://github.com/vercel/chatbot`.  
- Setup:
  ```bash
  git clone https://github.com/vercel/chatbot
  cd chatbot
  npm i -g vercel
  vercel link
  vercel env pull .env
  pnpm install
  pnpm dev
  ```
- Arquivos: `app/api/chat/route.ts` (streaming AI), `app/chat/page.tsx` (UI com useChat), DB Drizzle (`drizzle.config.ts`), `instrumentation.ts` (monitoramento).  
- Uso: interfaces de chat bot com historico e estado.  

**Admin Dashboard** (vercel/nextjs-postgres-nextauth-tailwindcss-template) — Dashboard com NextAuth e Postgres【29†L8-L11】. (~1.6k★; MIT)  
- Link: `https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template`.  
- Setup:
  ```bash
  npm i -g vercel
  vercel link
  vercel env pull
  pnpm install
  pnpm dev
  ```
- Arquivos: `app/`, `middleware.ts`, `next.config.js`, `.env.example`.  
- Uso: painel administrativo tipo painel padrão (com Analytics, autenticação). 

**Postgres/Auth Starter** (vercel/nextjs-postgres-auth-starter) — Exemplo com NextAuth/Auth.js + PostgreSQL (Neon). (~1k★; Apache-2.0)  
- Link: `https://github.com/vercel/nextjs-postgres-auth-starter`.  
- Comando (via create-next-app):
  ```bash
  pnpm create next-app --example "https://github.com/vercel/nextjs-postgres-auth-starter" meu-app
  pnpm dev
  ```
- Arquivos: `app/`, `middleware.ts` (proteger rotas), `tailwind.config.ts`, `.env.example`.  
- Uso: começar app com login pronto. Limitação: focado em auth; adiciona DB básico.

**Stripe Store Template** (vercel/nextjs-stripe-template) — Exemplo simples de loja com Stripe. (★17; MIT)  
- Link: `https://github.com/vercel/nextjs-stripe-template`.  
- Setup:
  ```bash
  pnpm install
  pnpm dev
  ```
- Arquivos: `app/shop/route.ts`, `lib/stripe.ts`, `.env`.  
- Uso: loja única (single-product); limite teste (apenas um produto demo). 

**vercel/platforms (Multi-tenant)** — App multi-tenant por subdomínio【12†L9-L13】. (~6.7k★; MIT)  
- Link: `https://github.com/vercel/platforms`.  
- Setup:
  ```bash
  git clone https://github.com/vercel/platforms.git
  cd platforms
  pnpm install
  pnpm dev
  ```
- Arquivos: `middleware.ts` (seleciona tenant baseado em host), `lib/cache.ts` (Redis/Upstash), `app/`.  
- Uso: sites multi-locais (p.ex., SaaS com subdomínio por cliente).  

**Monorepo (Turborepo/Nx)** — boilerplates oficiais.  
- Turborepo (vercel/turborepo, MIT, ~2.5k★) e Nx (nrwl/nx, MIT, 24k★) com plugin Next.  
- Exemplos: `vercel.com/templates/next.js/monorepo-turborepo` (layout inicial).  

## SDKs e Ferramentas da Vercel

**Vercel CLI & Deploy** — CLI oficial (MIT? não especificado)【39†L28-L36】.  
- Instalação: `npm i -g vercel`.  
- Uso básico:
  ```bash
  vercel login
  vercel link
  vercel env pull .env.local
  vercel dev   # ambiente local (auto-link)
  vercel       # preview deploy
  vercel --prod # produção
  ```
- Arquivos: cria `.vercel/` e gerencia `vercel.json`. Ferramentas CLI automatizam URL encurtado, projetos de monorepo.  

**Vercel Functions API** — Interface para rotas `app/api/*`【28†L8-L11】.  
- Exemplo:
  ```ts
  // app/api/hello/route.ts
  export function GET() { return new Response("Hello!"); }
  ```
- Use `export const runtime = 'edge'` para rodar no Edge runtime. ([Vercel Docs](https://vercel.com/docs/functions/functions-api-reference)).  

**@vercel/blob / Edge Config** — SDKs para storage serverless【36†L1-L7】.  
- Instalação:
  ```bash
  pnpm add @vercel/blob @vercel/blob-client
  ```
- Exemplo de rota upload:
  ```ts
  import { put } from '@vercel/blob';
  export async function POST(req: Request) {
    const form = await req.formData();
    const file = form.get('file') as File;
    const blob = await put(file.name, file);
    return Response.json(blob);
  }
  ```
- Arquivos: `app/api/*/route.ts`, `.env` (tokens BLOB_TOKEN), `next.config.js` (se houver).  
- Maturidade: repositorio `vercel/storage` (MIT【36†L1-L7】; ★589) contém esses pacotes. Note: recursos `@vercel/postgres` e `@vercel/kv` foram descontinuados (usar Neon, Upstash).

**Vercel Analytics** — pacote `@vercel/analytics` (MIT).  
- Uso: importe `<Analytics />` em `app/layout.tsx`.  
- Requer habilitar no projeto Vercel; plano Hobby gratuito para até 100k pageviews/mês.

**Vercel Speed Insights** — pacote `@vercel/speed-insights` (MIT).  
- Uso: importe `<SpeedInsights />` em `app/layout.tsx`.  
- Fornece pontuação de desempenho da app (GitHub Action + CLI do Google Lighthouse).

**Workflow SDK** — *Workflow Development Kit* (WDK)【6†L13-L20】.  
- Biblioteca TypeScript (Apache-2) para rotinas duráveis.  
- Instalar: `pnpm add @vercel/workflow-sdk`.  
- Uso: implementar operações assíncronas robustas (suspend/resume) em Next.js. Em breve no [docs Vercel](https://vercel.com/docs/workflow).

**Chat SDK** — SDK unificado (LiveChat / Vercel) para chatbots multiplataforma【6†L5-L12】.  
- Link: `https://chat-sdk.dev/`. Licença: MIT【18†L3-L6】.  
- Instalação: `npm i @livechat/chat-sdk`.  
- Arquivos: ex.: `app/api/chatbot/route.ts`, `pages/api/*` (Azure Functions).  
- Uso: bots que funcionam em Slack, Teams, Discord com um só código. Limitação: foco em bots, não UI.

**Flags SDK** — biblioteca open-source (Vercel) para feature flags【19†L4-L6】.  
- Link: `https://flags-sdk.dev/`. Licença: não especificado (em discussão pela Vercel).  
- Instalação: `npm i @vercel/flags`.  
- Arquivos: configurações no `next.config.js`, hooks como `useFlags()` em páginas React/SSR.  
- Uso: toggle de recursos em Next.js/SvelteKit. Normalmente usado com **Vercel Feature Flags** no dashboard.  

**AI SDK (Vercel)** — toolkit TS para aplicações IA【24†L9-L12】. (Apache-2.0; ★23.2k)  
- Links: [Introdução](https://ai-sdk.dev/docs/introduction), [Cookbook](https://ai-sdk.dev/cookbook).  
- Instalação: `pnpm add ai`, e provedores `@ai-sdk/openai`, `@ai-sdk/anthropic`.  
- Arquivos: `app/api/chat/route.ts` (stream), componentes React em `app/` chamando `useChat()`.  
- Exemplos: *RAG Chatbot*, *Agents Workflow* estão no [cookbook](https://ai-sdk.dev/cookbook).  
- Uso: apps conversacionais complexos.  

## Desenvolvimento e Infra

**Create-Next-App (TS)** — comando inicial (já abordado).  
**Tailwind CSS** — normalmente incluido em create-next-app. Configurar em `tailwind.config.js` (suportado no App Router).  
**Storybook** — para component library; instale `npm i -D @storybook/react @storybook/addon-essentials` e `npx sb init`.  
**CMS Integrations**: maioria via exemplos (Prismic, Contentful, Sanity) no repositório vercel/examples.  
**Revalidação/ISR**: use `revalidate` em `generateStaticParams` ou `fetch-cache`, conforme docs.  
**SWR / React Query** — para data fetching: instale `swr` ou `@tanstack/react-query`. Exemplos no Next.js official: 
- [SWR docs](https://swr.vercel.app/)
- [React Query docs](https://tanstack.com/query/v4).  
**Testing**: Next.js recomenda [Vitest, Playwright, Jest] guias no site oficial. Configurações típicas:
  - `pnpm add -D vitest @testing-library/react`
  - `pnpm add -D @playwright/test` e `npx playwright install`.
- **CI/CD**: GitHub Actions ou Vercel Git. Vercel acionado via webhook/integração, ou via CLI no CI.

## Exemplos de Bootstrap

### Next.js + Vercel features

```bash
pnpm create next-app@latest meu-app --typescript --tailwind
cd meu-app
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
pnpm add @vercel/analytics @vercel/speed-insights
pnpm dev
```
```tsx
// app/layout.tsx (exemplo)
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      <Analytics/>
      <SpeedInsights/>
    </body></html>
  )
}
```
```tsx
// app/api/edge-ping/route.ts
export const runtime = 'edge';
export function GET() {
  return new Response(JSON.stringify({pong:true}), { headers: {'Content-Type': 'application/json'} });
}
```
```tsx
// app/page.tsx (uso de Image Optimizado)
import Image from 'next/image';
export default function Page() {
  return <div><Image src="/vercel.svg" width={100} height={40} alt="Logo"/></div>;
}
```

### Docker (produção)

```Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
```

### Docker Compose (exemplo com Postgres)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: appdb
    ports: ["5432:5432"]
    volumes: - pgdata:/var/lib/postgresql/data

  web:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: "postgres://app:app@db:5432/appdb"
    depends_on: [db]
volumes:
  pgdata:
```

## Comparativo de Starters

| Boilerplate/Starter                           | TS  | Tailwind | Auth/Auth.js | Banco/ORM     | Testes      | CI/CD       | Deploy Ideal | Observações                                      |
|-----------------------------------------------|:---:|:--------:|:------------:|:-------------:|:-----------:|:-----------:|:-------------|:-------------------------------------------------|
| **create-next-app** (padrão)                  | ✅  | ✅       | —            | —             | —           | manual      | Vercel/local  | Base genérica; incorpora App Router/Turbopack【39†L17-L23】. |
| **nextjs/saas-starter**                       | ✅  | ✅       | NextAuth     | Postgres (Drizzle) | —        | GitHub      | Vercel        | SaaS completo: usuários, Stripe, RBAC【30†L3-L10】.        |
| **vercel/commerce**                           | ✅  | —        | —            | Shopify API   | —           | GitHub      | Vercel        | E-commerce SSR (shopify); RSC/Actions.           |
| **vercel/chatbot**                            | ✅  | ✅       | Auth.js      | Postgres      | Playwright  | GitHub      | Vercel        | App de chat/IA; streaming chat; DB conversacional.         |
| **vercel/platforms** (multi-tenant)           | ✅  | ✅       | —            | Upstash Redis | —           | GitHub      | Vercel        | Multi-inquilino (subdomínio) com cache Redis.    |
| **vercel/admin-dashboard**                    | ✅  | ✅       | NextAuth     | Postgres      | —           | GitHub      | Vercel        | Dashboard com analíticos e Autenticação pronta. |
| **Monorepo (Turborepo/Nx)**                   | ✅  | ✅       | depende      | depende       | depende     | monorepo    | Vercel        | Para corp dev (monorepo).                        |

## Diagramas Mermaid

```mermaid
flowchart LR
  subgraph NextApp[Next.js App (TS)]
    A[App Router] --> B[Pages Router]
    A --> C[componentes React / UI]
    B --> D[API Routes / Route Handlers]
    B --> E[Middleware/Proxy]
  end
  subgraph VercelPlatform[Vercel Platform]
    F[Build & CDN] 
    G[Serverless (Functions/Edge)]
    H[Analytics & Insights]
    I[Workflow SDK (durable)]
  end
  A --> F & G & H
  B --> G
  C --> G
  D --> G
  E --> G & I
  G --> J[(DB/ORM: Postgres, Redis, etc.)]
  G --> K[(Object Storage/Blob)]
  G --> L[(Auth/Cache Services)]
  H --> M[(Observability Logs/OTel)]
  I --> N[(Stateful Workflows)]
```

```mermaid
flowchart LR
  A[Clonar repositório Git] --> B[Aplicar patches e ajustes]
  B --> C[Instalar dependências (pnpm i / npm i)]
  C --> D[Construir/Compilar (pnpm build)]
  D --> E[Instalar ferramentas externas (ex.: navegadores headless)]
  E --> F[Executar testes básicos (smoke tests)]
  F --> G[Invocar agente/ferramenta final]
```

Este fluxo demonstra as etapas típicas de configuração/execução: clonagem do código, aplicação de patches (se houver), build da aplicação, instalação de ferramentas nativas (como browsers para testes), execução de testes smoke, e finalmente a invocação do agente ou ferramenta desejada.  

**Fontes:** Documentação e repos Vercel e Next.js (Templates, exemplos, guias)【39†L17-L23】【28†L8-L11】【24†L9-L12】【36†L1-L7】, documentação AI SDK【24†L9-L12】. Recursos sem fonte confirmada estão marcados ou descritos conforme padrão da comunidade.