import type { CanvasNodeData, NodeType, NodeStatus, CanvasEdgeData } from '../types';
import type { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { MarkerType } from '@xyflow/react';

export interface ScanResult {
  nodes: Node<CanvasNodeData>[];
  edges: Edge<CanvasEdgeData>[];
  meta: {
    projectName: string;
    framework: string;
    pages: number;
    apiRoutes: number;
    components: number;
  };
}

type FileEntry = {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileEntry[];
};

async function walkDirectory(
  handle: FileSystemDirectoryHandle,
  path = '',
  depth = 0,
  maxDepth = 6
): Promise<FileEntry[]> {
  if (depth > maxDepth) return [];
  const entries: FileEntry[] = [];
  for await (const [name, entry] of handle) {
    if (name.startsWith('.') || name === 'node_modules' || name === '.next' || name === 'dist' || name === '.git') continue;
    const fullPath = path ? `${path}/${name}` : name;
    if (entry.kind === 'directory') {
      const children = await walkDirectory(entry as FileSystemDirectoryHandle, fullPath, depth + 1, maxDepth);
      entries.push({ name, path: fullPath, isDir: true, children });
    } else {
      entries.push({ name, path: fullPath, isDir: false });
    }
  }
  return entries;
}

function flatFiles(entries: FileEntry[]): FileEntry[] {
  const result: FileEntry[] = [];
  for (const e of entries) {
    if (!e.isDir) result.push(e);
    if (e.children) result.push(...flatFiles(e.children));
  }
  return result;
}

function flatDirs(entries: FileEntry[]): FileEntry[] {
  const result: FileEntry[] = [];
  for (const e of entries) {
    if (e.isDir) result.push(e);
    if (e.children) result.push(...flatDirs(e.children));
  }
  return result;
}

function pathToRoute(filePath: string): string {
  return (
    '/' +
    filePath
      .replace(/^(app|pages)\//, '')
      .replace(/\/(page|layout|route)\.(tsx?|jsx?)$/, '')
      .replace(/\.(tsx?|jsx?)$/, '')
      .replace(/\/index$/, '')
      .replace(/\[\.\.\.([^\]]+)\]/, ':$1*')
      .replace(/\[([^\]]+)\]/g, ':$1')
      || '/'
  );
}

function guessNodeType(filePath: string): NodeType {
  if (filePath.includes('/api/')) return 'api';
  if (filePath.includes('middleware')) return 'middleware';
  if (filePath.includes('/auth/') || filePath.includes('auth.')) return 'auth';
  if (filePath.includes('/components/') || filePath.includes('/ui/')) return 'component';
  if (filePath.match(/page\.(tsx?|jsx?)$/)) return 'page';
  if (filePath.match(/route\.(tsx?|jsx?)$/) && filePath.includes('/api/')) return 'api';
  if (filePath.match(/route\.(tsx?|jsx?)$/)) return 'route';
  return 'page';
}

function labelFromPath(filePath: string): string {
  const parts = filePath
    .replace(/^(app|pages)\//, '')
    .replace(/\/(page|layout|route)\.(tsx?|jsx?)$/, '')
    .replace(/\.(tsx?|jsx?)$/, '')
    .split('/');
  const last = parts[parts.length - 1] || 'Home';
  return last
    .replace(/\[\.\.\.([^\]]+)\]/, '$1 (dynamic)')
    .replace(/\[([^\]]+)\]/, '[$1]')
    .replace(/\(([^)]+)\)/, '$1')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .trim() || 'Home';
}

function makeEdge(sourceId: string, targetId: string, relation: CanvasEdgeData['relation'], label: string): Edge<CanvasEdgeData> {
  return {
    id: uuidv4(),
    source: sourceId,
    target: targetId,
    type: 'canvasEdge',
    markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#323844' },
    data: { relation, label },
  };
}

function makeNode(
  id: string,
  type: NodeType,
  label: string,
  status: NodeStatus,
  position: { x: number; y: number },
  extra: Partial<CanvasNodeData> = {}
): Node<CanvasNodeData> {
  return {
    id,
    type: 'canvasNode',
    position,
    data: {
      id,
      type,
      label,
      status,
      routePath: '',
      filePath: '',
      description: '',
      notes: '',
      prompt: '',
      tasks: [],
      bugs: [],
      attachments: [],
      ...extra,
    },
  };
}

export async function scanProject(dirHandle: FileSystemDirectoryHandle): Promise<ScanResult> {
  const entries = await walkDirectory(dirHandle);
  const allFiles = flatFiles(entries);

  // Detect project name
  let projectName = dirHandle.name;
  let framework = 'Next.js';

  // Detect framework from package.json
  const pkgFile = allFiles.find((f) => f.name === 'package.json' && !f.path.includes('/'));
  if (pkgFile) {
    try {
      const fh = await resolveFile(dirHandle, pkgFile.path);
      const text = await fh.text();
      const pkg = JSON.parse(text);
      projectName = pkg.name || projectName;
      if (pkg.dependencies?.next) framework = `Next.js ${pkg.dependencies.next.replace(/[\^~]/, '')}`;
    } catch { /* ignore */ }
  }

  // Detect Next.js router type
  const isAppRouter = allFiles.some((f) => f.path.startsWith('app/') || f.path.startsWith('src/app/'));
  const isPagesRouter = allFiles.some((f) => f.path.startsWith('pages/') || f.path.startsWith('src/pages/'));

  const appPrefix = isAppRouter
    ? (allFiles.some((f) => f.path.startsWith('src/app/')) ? 'src/app' : 'app')
    : (allFiles.some((f) => f.path.startsWith('src/pages/')) ? 'src/pages' : 'pages');

  // Collect pages and routes
  const pageFiles = allFiles.filter((f) => {
    const p = f.path;
    if (!p.startsWith(appPrefix + '/')) return false;
    if (isAppRouter) return p.match(/\/(page|route)\.(tsx?|jsx?)$/);
    return p.match(/\.(tsx?|jsx?)$/) && !p.match(/\/_/) && !p.match(/\.(test|spec)\./);
  });

  // Detect middleware
  const middlewareFile = allFiles.find((f) => f.name === 'middleware.ts' || f.name === 'middleware.js');

  // Detect prisma
  const prismaFile = allFiles.find((f) => f.path.includes('prisma/schema.prisma') || f.path.includes('schema.prisma'));

  // Detect auth
  const authFiles = allFiles.filter((f) =>
    f.path.includes('auth') &&
    (f.path.includes('/api/') || f.path.includes('nextauth') || f.name.includes('auth'))
  );

  // Detect components
  const componentDirs = allFiles.filter((f) =>
    f.path.includes('/components/') || f.path.includes('/ui/') || f.path.includes('/shared/')
  );

  // Layout nodes for positioning
  const nodes: Node<CanvasNodeData>[] = [];
  const edges: Edge<CanvasEdgeData>[] = [];

  let pagesCreated = 0;
  let apiCreated = 0;

  // Group pages by directory depth
  const pagesByDepth: Map<number, typeof pageFiles> = new Map();
  for (const f of pageFiles) {
    const depth = f.path.split('/').length;
    const group = pagesByDepth.get(depth) || [];
    group.push(f);
    pagesByDepth.set(depth, group);
  }

  // Build page/route nodes
  const fileToNodeId = new Map<string, string>();
  const sortedDepths = Array.from(pagesByDepth.keys()).sort();

  for (let di = 0; di < sortedDepths.length; di++) {
    const depth = sortedDepths[di];
    const group = pagesByDepth.get(depth)!;
    const y = 120 + di * 160;
    const xSpacing = 240;
    const xStart = -(group.length - 1) * xSpacing * 0.5;

    for (let gi = 0; gi < group.length; gi++) {
      const f = group[gi];
      const isApi = f.path.includes('/api/');
      const nodeType = guessNodeType(f.path);
      const label = labelFromPath(f.path.replace(appPrefix + '/', ''));
      const route = pathToRoute(f.path.replace(appPrefix, ''));
      const id = uuidv4();
      fileToNodeId.set(f.path, id);

      const position = { x: xStart + gi * xSpacing + (isApi ? 800 : 0), y };

      nodes.push(makeNode(id, nodeType, label, 'stable', position, {
        routePath: route,
        filePath: f.path,
        description: `${framework} ${nodeType === 'api' ? 'API route' : 'page'}: ${route}`,
      }));

      if (isApi) apiCreated++;
      else pagesCreated++;
    }
  }

  // Build hierarchy edges (parent dir → child)
  for (const [childPath, childId] of fileToNodeId) {
    const parts = childPath.split('/');
    // Find parent page (one level up)
    for (let i = parts.length - 2; i >= 1; i--) {
      const parentCandidates = [
        parts.slice(0, i + 1).join('/') + '/page.tsx',
        parts.slice(0, i + 1).join('/') + '/page.ts',
        parts.slice(0, i + 1).join('/') + '/page.jsx',
        parts.slice(0, i + 1).join('/') + '/index.tsx',
      ];
      const parentPath = parentCandidates.find((p) => fileToNodeId.has(p));
      if (parentPath) {
        const parentId = fileToNodeId.get(parentPath)!;
        if (parentId !== childId) {
          edges.push(makeEdge(parentId, childId, 'navigates-to', 'navigates to'));
        }
        break;
      }
    }
  }

  // Home → Login edge (common pattern)
  const homePage = Array.from(fileToNodeId.entries()).find(([p]) =>
    p === `${appPrefix}/page.tsx` || p === `${appPrefix}/index.tsx`
  );
  const loginPage = Array.from(fileToNodeId.entries()).find(([p]) =>
    p.includes('/login/') || p.includes('/signin/') || p.includes('/auth/')
  );
  if (homePage && loginPage) {
    edges.push(makeEdge(homePage[1], loginPage[1], 'navigates-to', 'navigates to'));
  }

  // Middleware node
  let middlewareId: string | null = null;
  if (middlewareFile) {
    middlewareId = uuidv4();
    nodes.push(makeNode(middlewareId, 'middleware', 'Middleware', 'stable', { x: -300, y: 300 }, {
      filePath: middlewareFile.path,
      description: 'Route-level middleware',
    }));

    // Middleware guards pages
    for (const [, nid] of fileToNodeId) {
      edges.push(makeEdge(middlewareId, nid, 'auth-guards', 'guards'));
      if (edges.length > 50) break; // cap
    }
  }

  // Prisma / Database node
  let prismaId: string | null = null;
  if (prismaFile) {
    prismaId = uuidv4();
    nodes.push(makeNode(prismaId, 'database', 'Database (Prisma)', 'stable', { x: 900, y: 500 }, {
      filePath: prismaFile.path,
      description: 'Prisma ORM — PostgreSQL',
    }));

    // API routes → Prisma
    for (const [p, nid] of fileToNodeId) {
      if (p.includes('/api/')) {
        edges.push(makeEdge(nid, prismaId, 'queries', 'queries'));
      }
    }
  }

  // Auth node (NextAuth)
  const nextAuthFile = allFiles.find((f) =>
    f.path.includes('nextauth') || f.path.includes('auth/route') || f.path.match(/auth\/\[/)
  );
  if (nextAuthFile || authFiles.length > 0) {
    const authId = uuidv4();
    const authFilePath = nextAuthFile?.path || authFiles[0]?.path || '';
    nodes.push(makeNode(authId, 'auth', 'Auth', 'stable', { x: -300, y: 500 }, {
      filePath: authFilePath,
      description: 'Authentication provider',
    }));

    if (middlewareId) {
      edges.push(makeEdge(middlewareId, authId, 'auth-guards', 'uses auth'));
    }

    if (prismaId) {
      edges.push(makeEdge(authId, prismaId, 'queries', 'queries users'));
    }
  }

  return {
    nodes,
    edges,
    meta: {
      projectName,
      framework,
      pages: pagesCreated,
      apiRoutes: apiCreated,
      components: componentDirs.length,
    },
  };
}

async function resolveFile(root: FileSystemDirectoryHandle, path: string): Promise<File> {
  const parts = path.split('/');
  let current: FileSystemDirectoryHandle = root;
  for (let i = 0; i < parts.length - 1; i++) {
    current = await current.getDirectoryHandle(parts[i]);
  }
  const fileHandle = await current.getFileHandle(parts[parts.length - 1]);
  return fileHandle.getFile();
}

// ─── Babalux Preset ────────────────────────────────────────────────────────

export function buildBabaluxPreset(): ScanResult {
  const nodes: Node<CanvasNodeData>[] = [];
  const edges: Edge<CanvasEdgeData>[] = [];

  function n(id: string, type: NodeType, label: string, status: NodeStatus, x: number, y: number, extra: Partial<CanvasNodeData> = {}) {
    nodes.push(makeNode(id, type, label, status, { x, y }, extra));
  }
  function e(src: string, tgt: string, rel: CanvasEdgeData['relation'], label: string) {
    edges.push(makeEdge(src, tgt, rel, label));
  }

  // Camada Pública
  n('home', 'page', 'Home', 'stable', 600, 0, { routePath: '/', filePath: 'app/page.tsx', description: 'Landing page pública com acesso ao Feed, Busca e Auth' });
  n('busca', 'page', 'Busca', 'stable', 200, 160, { routePath: '/busca', filePath: 'app/busca/page.tsx', description: 'Listagem de perfis com filtros (cidade, tipo)' });
  n('cidade', 'route', 'Busca por Cidade', 'stable', 0, 320, { routePath: '/busca/:cidade', filePath: 'app/busca/[cidade]/page.tsx', description: 'Filtro geográfico via Typesense' });
  n('feed', 'page', 'Feed Social', 'stable', 400, 160, { routePath: '/feed', filePath: 'app/feed/page.tsx', description: 'Feed de posts dos anunciantes' });
  n('planos', 'page', 'Planos e Preços', 'stable', 600, 160, { routePath: '/planos', filePath: 'app/planos/page.tsx' });
  n('blog', 'page', 'Blog', 'planned', 800, 160, { routePath: '/blog', filePath: 'app/blog/page.tsx' });
  n('termos', 'page', 'Termos de Uso', 'stable', 1000, 160, { routePath: '/termos', filePath: 'app/termos/page.tsx' });
  n('ajuda', 'page', 'Central de Ajuda', 'planned', 1200, 160, { routePath: '/ajuda', filePath: 'app/ajuda/page.tsx' });

  // Auth
  n('auth', 'auth', 'Login / Cadastro', 'stable', 600, 320, { routePath: '/login', filePath: 'app/login/page.tsx', description: 'NextAuth.js — JWT + Roles (USER, ADVERTISER, ADMIN)' });
  n('nextauth', 'api', 'NextAuth API', 'stable', 800, 480, { routePath: '/api/auth/[...nextauth]', filePath: 'app/api/auth/[...nextauth]/route.ts' });

  // Área do Cliente
  n('conta', 'page', 'Conta do Cliente', 'stable', 200, 480, { routePath: '/conta', filePath: 'app/conta/page.tsx', description: 'Perfil do usuário logado' });
  n('editconta', 'page', 'Editar Conta', 'in-progress', 0, 640, { routePath: '/conta/editar', filePath: 'app/conta/editar/page.tsx' });
  n('mensagens', 'page', 'Mensagens (Chat)', 'in-progress', 200, 640, { routePath: '/mensagens', filePath: 'app/mensagens/page.tsx', description: 'Chat em tempo real entre clientes e anunciantes' });
  n('favoritos', 'page', 'Favoritos', 'stable', 400, 640, { routePath: '/favoritos', filePath: 'app/favoritos/page.tsx' });

  // Área do Anunciante
  n('wizard', 'page', 'Wizard de Cadastro', 'stable', 600, 480, { routePath: '/cadastro', filePath: 'app/cadastro/page.tsx', description: 'Onboarding do anunciante — primeira vez' });
  n('dashboard', 'page', 'Dashboard Anunciante', 'stable', 800, 640, { routePath: '/dashboard', filePath: 'app/dashboard/page.tsx', description: 'Painel principal do anunciante — stats, performance' });
  n('pubperfil', 'page', 'Perfil Público (Vitrine)', 'stable', 600, 800, { routePath: '/anunciante/:slug', filePath: 'app/anunciante/[slug]/page.tsx', description: 'Vitrine pública do anunciante' });
  n('managefeed', 'page', 'Gerenciar Posts', 'stable', 800, 800, { routePath: '/dashboard/posts', filePath: 'app/dashboard/posts/page.tsx' });
  n('managestories', 'page', 'Gerenciar Stories', 'in-progress', 1000, 800, { routePath: '/dashboard/stories', filePath: 'app/dashboard/stories/page.tsx' });
  n('kyc', 'page', 'Verificação KYC', 'planned', 1200, 800, { routePath: '/dashboard/kyc', filePath: 'app/dashboard/kyc/page.tsx', description: 'Upload de documentos de identificação' });

  // Backend / Serviços
  n('actions', 'api', 'Server Actions', 'stable', 400, 960, { description: 'getFeedPosts, createFeedPost, updateProfile, etc.', filePath: 'app/actions/' });
  n('nsfw', 'middleware', 'NSFW.js Moderação', 'stable', 200, 960, { description: 'Análise automática de imagens no pipeline de upload' });
  n('media', 'component', 'Sharp / Next-Video', 'stable', 600, 960, { description: 'Processamento de imagens: WebP, watermarks, otimização de vídeo' });
  n('prisma', 'database', 'Prisma ORM', 'stable', 400, 1120, { description: 'Modelagem e acesso ao banco PostgreSQL' });
  n('postgres', 'database', 'PostgreSQL', 'stable', 200, 1280, { description: 'Banco de dados principal' });
  n('typesense', 'gateway', 'Typesense Search', 'in-progress', 0, 1280, { description: 'Motor de busca geográfica ultrarrápida com filtros em tempo real' });
  n('s3', 'database', 'S3 Storage', 'stable', 600, 1280, { description: 'Armazenamento de imagens e vídeos (Vercel Blob ou AWS S3)' });
  n('middleware', 'middleware', 'Middleware Next.js', 'stable', 1000, 480, { routePath: '/middleware.ts', description: 'Proteção de rotas autenticadas — redireciona para /login' });

  // Edges — Navegação pública
  e('home', 'busca', 'navigates-to', 'navigates to');
  e('home', 'feed', 'navigates-to', 'navigates to');
  e('home', 'planos', 'navigates-to', 'navigates to');
  e('home', 'blog', 'navigates-to', 'navigates to');
  e('home', 'auth', 'navigates-to', 'navigates to');
  e('home', 'termos', 'navigates-to', 'navigates to');
  e('home', 'ajuda', 'navigates-to', 'navigates to');
  e('busca', 'cidade', 'navigates-to', 'navega para');
  e('busca', 'pubperfil', 'navigates-to', 'abre perfil');

  // Edges — Auth
  e('auth', 'conta', 'navigates-to', 'cliente logado');
  e('auth', 'wizard', 'navigates-to', 'anunciante novo');
  e('auth', 'dashboard', 'navigates-to', 'anunciante voltando');
  e('nextauth', 'prisma', 'queries', 'valida sessão');

  // Edges — Middleware
  e('middleware', 'auth', 'auth-guards', 'redireciona');
  e('middleware', 'dashboard', 'auth-guards', 'protege');
  e('middleware', 'mensagens', 'auth-guards', 'protege');
  e('middleware', 'favoritos', 'auth-guards', 'protege');
  e('middleware', 'conta', 'auth-guards', 'protege');

  // Edges — Área cliente
  e('conta', 'editconta', 'navigates-to', 'editar');
  e('conta', 'mensagens', 'navigates-to', 'mensagens');
  e('conta', 'favoritos', 'navigates-to', 'favoritos');

  // Edges — Área anunciante
  e('wizard', 'dashboard', 'navigates-to', 'acesso ao painel');
  e('dashboard', 'pubperfil', 'navigates-to', 'ver vitrine');
  e('dashboard', 'managefeed', 'navigates-to', 'gerenciar posts');
  e('dashboard', 'managestories', 'navigates-to', 'gerenciar stories');
  e('dashboard', 'kyc', 'navigates-to', 'verificação');

  // Edges — Backend
  e('feed', 'actions', 'calls-api', 'getFeedPosts');
  e('managefeed', 'actions', 'calls-api', 'createFeedPost');
  e('managestories', 'actions', 'calls-api', 'createStory');
  e('mensagens', 'actions', 'calls-api', 'sendMessage');
  e('actions', 'nsfw', 'triggers', 'valida imagem');
  e('actions', 'media', 'triggers', 'processa mídia');
  e('actions', 'prisma', 'queries', 'acessa dados');
  e('media', 's3', 'triggers', 'upload');
  e('nsfw', 's3', 'triggers', 'bloqueia se NSFW');
  e('prisma', 'postgres', 'queries', 'SQL');
  e('postgres', 'typesense', 'triggers', 'sync busca');
  e('cidade', 'typesense', 'calls-api', 'geo-search');

  return {
    nodes,
    edges,
    meta: {
      projectName: 'Babalux (Califado VIP)',
      framework: 'Next.js 15',
      pages: 17,
      apiRoutes: 2,
      components: 2,
    },
  };
}
