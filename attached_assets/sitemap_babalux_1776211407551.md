# Árvore de Navegação (Sitemap) - Babalux

Este documento descreve a hierarquia de páginas e o fluxo de caminhos do site para visitantes, clientes e anunciantes.

```mermaid
graph TD
    %% Home e Raiz Públicas
    Home["🏠 Home (/)"]
    
    %% Área Pública
    subgraph "Nível 1: Visitante (Público)"
        Home --> Busca["🔍 Busca / Acompanhantes"]
        Busca --> Cidade["📍 Busca por Cidade/Estado"]
        Home --> Feed["📱 Feed Social"]
        Home --> Planos["💳 Planos e Preços"]
        Home --> Blog["📰 Blog"]
        Home --> Auth["🔑 Login / Cadastro"]
    end

    %% Área do Cliente Logado
    subgraph "Nível 2: Conta do Cliente (USER)"
        Auth --> PerfilCl["👤 Ver Perfil (USER)"]
        PerfilCl --> EditCl["⚙️ Editar Conta"]
        Auth --> Msg["💬 Mensagens (Chat)"]
        Auth --> Fav["❤️ Meus Favoritos"]
    end

    %% Área do Anunciante
    subgraph "Nível 2: Painel do Anunciante (ADVERTISER)"
        Auth --> Wizard["🧙 Cadastro Wizard (Primeira vez)"]
        Wizard --> Dash["📊 Dashboard Principal"]
        Dash --> PubPerfil["✨ Perfil Público (Vitrine)"]
        Dash --> ManageFeed["📝 Gerenciar Meus Posts"]
        Dash --> ManageStories["🎥 Gerenciar Meus Stories"]
        Dash --> KYC["🆔 Verificação ID / Documentos"]
    end

    %% Rodapé e Institucional
    subgraph "Nível 1: Institucional"
        Home --> Termos["📜 Termos de Uso"]
        Home --> Ajuda["❓ Central de Ajuda"]
    end

    %% Cores e Estilos
    style Home fill:#f59e0b,stroke:#000,stroke-width:2px,color:#000
    style Wizard fill:#8b5cf6,color:#fff
    style Dash fill:#d97706,color:#fff
    style PerfilCl fill:#10b981,color:#fff
```

## Resumo das Conexões

1. **Visitante:** Pode acessar todas as páginas do Nível 1.
2. **Cliente Logado:** Acessa as funções de interação (Chat, Favoritos).
3. **Anunciante:** O conteúdo inserido no dashboard (Nível 2) alimenta o que o Visitante vê no Nível 1 (Perfil e Feed).
