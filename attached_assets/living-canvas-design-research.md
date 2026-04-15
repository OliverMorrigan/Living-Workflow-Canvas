# Living Canvas — Pesquisa de Design & Boas Práticas
**Data:** Abril 2026 | Metodologia: Deep Research (5 agentes paralelos + buscas diretas)

---

## Sumário Executivo

O Living Canvas posiciona-se na interseção de três categorias de produto:
1. **Editor de workflow visual** (n8n, Figma, Miro) — para diagramar arquitetura
2. **Ferramenta de desenvolvedor** (Linear, Vercel Dashboard, Supabase) — para gerenciar estado do projeto
3. **Sistema de documentação viva** (Arc, Notion, Storybook) — para registrar intenção e decisões

As melhores ferramentas nestas categorias convergem para um conjunto consistente de princípios de design. Este documento sintetiza esses princípios e identifica oportunidades concretas para o Living Canvas.

---

## Parte 1: Padrões Visuais (Visual Language)

### 1.1 Paleta & Cores

**O padrão da indústria em 2025 para developer tools:**

| Camada | Uso | Valor recomendado |
|--------|-----|-------------------|
| Canvas background | Fundo do infinito | `#0a0b0d` – `#111216` |
| Surface L1 | Painéis/sidebars | `#13151a` – `#1a1d23` |
| Surface L2 | Cards/nós | `#1a1d23` – `#1e2330` |
| Surface L3 | Inputs/hover | `#252830` – `#2e3340` |
| Border subtle | Separadores | `#1e2128` – `#252830` |
| Border visible | Bordas de cards | `#2e3340` – `#363b48` |
| Text primary | Labels, títulos | `#dde3ed` – `#e8ecf4` |
| Text secondary | Metadados | `#8b95a5` – `#9ca3af` |
| Text muted | Placeholders | `#4b5563` – `#3d4455` |
| Text ghost | Dicas, shortcuts | `#252830` – `#1e2128` |

**Accentuation (cor de destaque por tipo de nó):**
- Use LCH color space para garantir igual luminância entre diferentes hues
- Cada tipo de nó tem 1 cor de acento única — nunca use mais de 9 cores simultâneas no canvas
- A borda esquerda colorida (3-4px) é o padrão n8n: comunica tipo sem poluir visualmente

### 1.2 Tipografia

```
Hierarquia tipográfica para developer tools:

TÍTULO DE SEÇÃO    9px, monospace, uppercase, letter-spacing 0.08em, color: muted
Nome do nó        12px, Inter Semibold (600), color: text-primary
Tag de tipo        9px, monospace, uppercase, color: text-ghost
Metadados          10px, monospace, color: text-secondary
Conteúdo           12px, Inter Regular, line-height 1.5, color: text-secondary
IDs/hashes         9px, monospace, color: text-ghost
Código/paths       11px, JetBrains Mono, color: text-secondary
```

**Regra de ouro:** Inter para conteúdo humano, JetBrains Mono para dados de sistema (IDs, paths, hashes, contagens).

### 1.3 Densidade & Espaçamento

Linear e Planetscale estabeleceram o padrão: desenvolvedores preferem **alta densidade** — ver mais informação de uma vez em vez de whitespace generoso.

- Nós compactos: 160-180px de largura, altura mínima (~44px)
- Padding interno: 8px vertical, 10px horizontal
- Espaçamento entre seções no painel: 14-16px
- Tamanho de fonte mínimo viável: 9px para metadados
- Gap entre ícone e label: 6-8px

---

## Parte 2: Padrões de Interação

### 2.1 Navegação — O Padrão Command Bar (⌘K)

**O padrão ouro de 2024-2025:** todas as ações devem ser acessíveis por uma Command Bar global (⌘K / Ctrl+K).

Exemplos que validam:
- **Linear**: ⌘K abre busca de issues, projetos, ações
- **Vercel**: ⌘K navega entre projetos, deployments, configs
- **Supabase**: ⌘K busca tabelas, queries, documentação

**Para o Living Canvas:**
```
⌘K → buscar nós por nome/tipo/status
⌘K → criar nó de tipo X
⌘K → ir para snapshot Y
⌘K → conectar nó A ao nó B
```

### 2.2 Canvas — Padrões Universais

| Comportamento | Implementação padrão |
|---------------|---------------------|
| Pan (mover canvas) | Spacebar + Drag OU Middle-click Drag |
| Zoom | Scroll de mouse / Pinch trackpad |
| Seleção múltipla | Shift + Click OU drag selection box |
| Snap to grid | Opcional, toggle com 'G' |
| Fit to view | 'F' OU duplo-clique no canvas vazio |
| Zoom 100% | '0' (zero) |
| Novo nó | 'N' → type picker OU double-click no canvas |
| Deletar | Del / Backspace quando selecionado |
| Copiar/Colar | ⌘C / ⌘V |
| Undo/Redo | ⌘Z / ⌘⇧Z |

### 2.3 Nós — Comportamento do n8n vs Figma

**n8n (fluxo de execução):**
- Clique único → seleciona + mostra handles
- Duplo-clique → abre painel de configuração
- Handles aparecem no hover, não por padrão
- Conexão: drag do handle de output → handle de input

**Figma (design canvas):**
- Clique único → seleciona + painel de propriedades aparece à direita
- Duplo-clique → edita conteúdo in-place
- Seleção múltipla mostra propriedades compartilhadas

**Recomendação para Living Canvas:**
```
Clique único → seleciona + InspectorPanel abre à direita (atual ✓)
Duplo-clique → edita o label in-place
Hover → mostra handles de conexão
Shift+Click → adiciona à seleção múltipla
```

### 2.4 Progressive Disclosure

**Princípio-chave:** O nó mostra apenas o essencial. Detalhes vivem no painel contextual.

Hierarquia de disclosure:
```
Nível 0 (no canvas):     [ícone] [label] [tipo] [status dot] [bug/task badge]
Nível 1 (selecionado):   + borda highlight + InspectorPanel aparece
Nível 2 (painel):        prompt, notas, descrição, rota, arquivo, tasks, bugs
Nível 3 (expansão):      histórico de mudanças, diff de snapshots, visualização de dependências
```

---

## Parte 3: Arquitetura de Informação (IA)

### 3.1 O Modelo de Três Regiões

Usado por n8n, Figma, Vercel Dashboard, Linear:

```
┌─────────────────────────────────────────────────────────┐
│                     TOOLBAR (40px)                       │
├──────────┬────────────────────────────┬──────────────────┤
│          │                            │                  │
│  LEFT    │      CANVAS               │   INSPECTOR      │
│  PALETTE │      (infinite)            │   PANEL          │
│  (108px) │                            │   (300px)        │
│          │                            │   contextual     │
│  node    │   [nodes + edges]          │   only opens     │
│  types   │                            │   on selection   │
│          │                            │                  │
├──────────┴────────────────────────────┴──────────────────┤
│            SHORTCUTS / STATUS BAR (20px)                 │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Hierarquia de Recursos (para expansão futura)

```
Living Canvas
├── Projetos / Workspaces
│   ├── Canvas (grafo visual)
│   │   ├── Nós (workflow nodes)
│   │   └── Arestas (conexões tipadas)
│   ├── Snapshots (git-like history)
│   ├── Planos (gerados pelo agente)
│   └── Configurações
└── Integrações
    ├── GitHub (snapshot → PR)
    ├── Vercel (deploy status per node)
    └── Codebase Scanner (sincroniza grafo com /src)
```

### 3.3 Empty States — Boas Práticas

Ferramentas como Linear e Vercel fazem empty states com:
1. **Ícone grande e discreto** (opacity 0.08–0.15)
2. **Título claro** do que está faltando
3. **Instrução direta** de como preencher ("Pressione N para adicionar...")
4. **Ação primária** opcional (botão suave ou atalho)

---

## Parte 4: Bibliotecas e Tecnologia

### 4.1 Stack Atual — Validada pela Indústria

| Camada | Biblioteca | Status |
|--------|-----------|--------|
| Canvas engine | `@xyflow/react` (22k+ ⭐, MIT) | ✅ Padrão da indústria |
| State management | Zustand | ✅ Mesmo usado pelo XYFlow internamente |
| Styling | Inline CSS + Tailwind | ✅ Adequado para developer tools |
| TypeScript | Strict mode | ✅ Recomendado |

**XYFlow é a escolha certa.** n8n, Typebot, Flyde, Langflow e dezenas de outros editores de workflow profissionais usam XYFlow/ReactFlow. Para visualização de grafos massivos (>5k nós), considerar Reagraph (WebGL) no futuro.

### 4.2 Patterns de Código de Referência

**Plugin Architecture (n8n pattern):**
```typescript
// Registry de tipos → renderização dinâmica
const nodeTypes = {
  page: PageNode,
  api: ApiNode,
  // ...
};
// CanvasView não conhece a lógica do nó,
// apenas registra e delega renderização
```

**Unidirectional Data Flow (XYFlow pattern):**
```typescript
// Estado do grafo é fonte da verdade única
// Mudanças (drag, connect) disparam eventos
// que atualizam o store Zustand
onNodesChange → store.setNodes(applyChanges)
onConnect → store.addEdge(newEdge)
```

### 4.3 Performance Patterns

- **Memoize** todos os nós com `memo()` — impede re-renders desnecessários
- **nodeTypes fora do componente** — evita warning do ReactFlow sobre re-criação
- **Viewport culling** — ReactFlow faz automaticamente com `virtualize` props
- **Edge labels só quando selected** — implementado ✓

---

## Parte 5: Ferramentas de Arquitetura de Software (Mercado)

### 5.1 Concorrentes e Inspirações Diretas

| Ferramenta | Abordagem | Diferencial |
|-----------|-----------|-------------|
| **Mermaid** | Texto → Diagrama | Integrado ao GitHub, mas estático |
| **Excalidraw** | Canvas livre | Whiteboard collaborativo, não tipado |
| **Lucidchart** | Diagramas corporativos | Completo, mas pesado |
| **Whimsical** | Flowcharts visuais | Mais clean, mas genérico |
| **Storybook** | Docs de componentes | Foca UI, não fluxo |
| **dependency-cruiser** | Grafo de deps do código | Auto-gerado, não editável |
| **Madge** | Visualização de módulos | CLI, sem editor visual |
| **C4 Model** | Diagramas de arquitetura | 4 níveis (System→Code), mas manual |

### 5.2 O Espaço Vazio que o Living Canvas Preenche

Não existe hoje uma ferramenta que:
1. **Lê o codebase** e gera o grafo automaticamente
2. **Permite edição visual** do grafo (adicionar nós, conexões, anotações)
3. **Funciona como git** para a arquitetura (snapshots = commits visuais)
4. **Conecta com CI/CD** (Vercel, GitHub PRs)
5. **Alimenta agentes de IA** com contexto estruturado (prompt por nó)

Este é o diferencial do Living Canvas.

---

## Parte 6: Referências Visuais & Modelos

### 6.1 Ferramentas para Estudar

- **n8n Editor**: https://app.n8n.io — observar layout, handles, tipos de nó
- **Langflow**: https://www.langflow.org — inspiração para canvas de AI workflows
- **Typebot**: https://typebot.io — excelente exemplo de canvas clean com nodes tipados
- **Flyde**: https://www.flyde.dev — programação visual, UI minimalista
- **Retool Workflow**: https://retool.com/products/workflows — inspector panel de referência

### 6.2 Design Systems de Referência

- **Radix Colors**: https://www.radix-ui.com/colors — sistema de cores para dark mode
- **Linear Design System** (método): https://linear.app/method/designing-linear
- **Vercel Design**: https://vercel.com/design — tokens de cor e componentes

### 6.3 Documentação de Boas Práticas

- **XYFlow docs**: https://reactflow.dev/learn — padrões e anti-patterns
- **n8n Node UI Design**: https://docs.n8n.io/integrations/creating-nodes/plan/node-ui-design/
- **NNGroup Workflow Diagrams**: https://nngroup.com/articles/workflow-diagram-usability/
- **Awesome Node-Based UIs**: https://github.com/xyflow/awesome-node-based-uis

---

## Parte 7: Roadmap de Melhorias para o Living Canvas

### Fase 1 — Fundação Visual (agora)
- [x] Dark-first design com camadas de elevação consistentes
- [x] Nós compactos estilo n8n (168px, borda esquerda colorida)
- [x] InspectorPanel contextual (abre na seleção)
- [x] Keyboard shortcuts essenciais
- [ ] **Command Bar (⌘K)** — ação de maior impacto ainda faltante
- [ ] **Double-click para editar label** inline no nó
- [ ] **Hover reveals handles** (handles aparecem no hover do nó)
- [ ] **Snap to grid** com toggle (G)
- [ ] **Fit to view** com F key

### Fase 2 — Interações Avançadas
- [ ] Multi-seleção com Shift+Click e drag box
- [ ] Copy/Paste de nós (⌘C / ⌘V)
- [ ] Undo/Redo (⌘Z / ⌘⇧Z)
- [ ] Agrupamento visual de nós (Group)
- [ ] Minimap com clique para navegar
- [ ] Zoom com scroll + ctrl

### Fase 3 — Dados Reais
- [ ] Scanner de codebase Next.js (parsear /app, /pages, /api)
- [ ] Importar Mermaid → Canvas
- [ ] Exportar Canvas → Mermaid
- [ ] GitHub integration (snapshot → commit)
- [ ] Vercel status por nó (deployment status)

### Fase 4 — IA & Agentes
- [ ] Streaming chat por nó (Vercel AI SDK)
- [ ] Geração de PR por plano (GitHub API)
- [ ] Multi-agent orchestration visual
- [ ] Sugestão automática de arestas baseada em análise de código

---

## Conclusão

O Living Canvas já está bem fundamentado tecnicamente (XYFlow, Zustand, TypeScript). As maiores oportunidades de melhoria são:

1. **Command Bar** — o padrão mais impactante que falta
2. **Hover-reveal handles** — interação mais natural para conexões
3. **Double-click inline edit** — expectativa universal em canvas editors
4. **Undo/Redo** — crítico para ferramentas de edição
5. **Snap to grid** — melhora a organização

O design visual atual está alinhado com as melhores práticas da indústria para developer tools (dark, denso, monocromático, acent colorido). O próximo passo é aprofundar as **interações** e começar a construir o **scanner de codebase**.

---

*Pesquisa realizada com 5 agentes paralelos. Fontes: n8n docs, Linear Method, XYFlow GitHub, NNGroup, Vercel Design, GitHub awesome-node-based-uis.*
