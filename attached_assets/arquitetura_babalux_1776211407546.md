# Arquitetura Técnica - Babalux (Califado VIP)

Este diagrama descreve o fluxo de dados e a integração entre os componentes do sistema.

```mermaid
graph TD
    %% Camada de Usuário
    Client((Usuário / Browser))
    
    %% Camada de Frontend (Next.js App Router)
    subgraph "Frontend (Next.js 15 + Tailwind)"
        Public[Páginas Públicas<br/>Home, Feed, Busca]
        Dash[Dashboard do Anunciante<br/>Edição de Vitrine, Stats]
        UserAcc[Conta do Cliente<br/>Chat, Favoritos]
    end

    %% Camada de Lógica (Server Side)
    subgraph "Backend (Server Actions & API)"
        Actions[Server Actions<br/>getFeedPosts, createFeedPost]
        Auth[NextAuth / JWT<br/>Gestão de Sessão e Roles]
        Moderation[NSFW.js<br/>Moderação de Imagens]
        Media[Sharp / Next-Video<br/>Watermarks e Otimização]
    end

    %% Camada de Dados
    subgraph "Database & Search"
        Prisma[Prisma ORM<br/>Modelagem de Dados]
        PostgreSQL[(PostgreSQL<br/>Dados do Site)]
        Typesense[[Typesense Search<br/>Geo-search Ultrarrápida]]
        S3[Media Storage<br/>Imagens e Vídeos]
    end

    %% Conexões
    Client --> Public
    Client --> Dash
    Client --> UserAcc
    
    Public --> Actions
    Dash --> Actions
    UserAcc --> Actions
    
    Actions --> Auth
    Actions --> Moderation
    Actions --> Media
    
    Auth --> Prisma
    Media --> S3
    Prisma --> PostgreSQL
    PostgreSQL -.-> Typesense
```

## Componentes Principais

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Estilo:** Tailwind CSS
- **Componentes:** Radix UI / Shadcn UI
- **Animações:** Framer Motion

### Backend & Lógica
- **Autenticação:** NextAuth.js (com Roles flexíveis)
- **Moderação:** NSFW.js integrada no pipeline de upload
- **Processamento de Imagem:** Sharp para conversão WebP e marcas d'água
- **Vídeo:** Vercel / Next-Video

### Dados & Busca
- **ORM:** Prisma
- **Motor de Busca:** Typesense (específico para busca geográfica e filtros em tempo real)
- **Infra:** PostgreSQL local/nuvem
