# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Living Software Canvas (`artifacts/living-canvas`)

- **Type**: react-vite, preview at `/`
- **Purpose**: Visual workflow canvas for planning and communicating changes in complex Next.js projects with AI assistance
- **Stack**: React + Vite, @xyflow/react (React Flow), Zustand (with localStorage persistence), Tailwind CSS
- **Features**:
  - Draggable canvas with 9 custom node types: page, route, component, api, auth, middleware, database, gateway, ui-action
  - Custom labeled edges with 9 relationship types
  - Right inspector panel with tabs: context, tasks, bugs, prompt
  - Left palette for adding node types
  - Snapshot system: save named snapshots, restore, diff/compare between two snapshots
  - Ask Agent / Generate Plan: produces natural-language change plan from whole canvas or selected node
  - Pre-seeded with a realistic Next.js product map (Home, Login, Dashboard, Admin, Profile, API Auth, Middleware, DB, Payment Gateway)
  - Dark mode developer UI throughout
  - Local persistence via localStorage (Zustand persist)

### API Server (`artifacts/api-server`)

- **Type**: Express API
- **Purpose**: Backend API server
- **Preview path**: `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Future Extension Points (Living Canvas)

- **GitHub snapshots**: Save canvas snapshots as GitHub gists or commits
- **Vercel Blob attachments**: Real file/screenshot uploads per node
- **Vercel AI SDK/Gateway**: Real AI-powered plan generation (currently simulated)
- **Graph-It-Live scanning**: Auto-populate canvas by scanning a real Next.js codebase
