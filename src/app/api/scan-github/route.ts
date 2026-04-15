import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { MarkerType } from '@xyflow/react';
import type { CanvasNodeData, NodeType, NodeStatus, CanvasEdgeData } from '@/types';
import type { Node, Edge } from '@xyflow/react';

const execAsync = promisify(exec);

// Duplicate lightweight utils from scanner.ts to avoid client-side DOM dependencies in the API
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

function pathToRoute(filePath: string): string {
  return (
    '/' +
    filePath
      .replace(/^(app|pages)\//, '')
      .replace(/\/(page|layout|route)\.(tsx?|jsx?)$/, '')
      .replace(/\.(tsx?|jsx?)$/, '')
      .replace(/\/index$/, '')
      .replace(/\[\.\.\.([^\]]+)\]/, ':$1*')
      .replace(/\[([^\]]+)\]/g, ':$1') || '/'
  );
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
    data: { id, type, label, status, routePath: '', filePath: '', description: '', notes: '', prompt: '', tasks: [], bugs: [], attachments: [], ...extra },
  };
}

// Recursively walk a directory using Node's fs
async function walkDir(dir: string, baseDir: string, maxDepth = 6, currentDepth = 0): Promise<{ name: string; path: string; isDir: boolean }[]> {
  if (currentDepth > maxDepth) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let results: { name: string; path: string; isDir: boolean }[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build', '.next'].includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      results.push({ name: entry.name, path: relPath, isDir: true });
      const sub = await walkDir(fullPath, baseDir, maxDepth, currentDepth + 1);
      results = results.concat(sub);
    } else {
      results.push({ name: entry.name, path: relPath, isDir: false });
    }
  }
  return results;
}

export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl || !repoUrl.startsWith('https://github.com/')) {
      return NextResponse.json({ error: 'URL do GitHub inválida.' }, { status: 400 });
    }

    // 1. Prepare temporary directory
    const tempId = uuidv4();
    const tempDir = path.join(os.tmpdir(), `living-canvas-${tempId}`);

    // 2. Clone the repository very quickly using --depth 1
    // Apenas a última modificação branch default pra ser rápido
    await execAsync(`git clone --depth 1 ${repoUrl} ${tempDir}`);

    // 3. Scan the directory
    const allFiles = await walkDir(tempDir, tempDir);
    const filesOnly = allFiles.filter(f => !f.isDir);

    // -- Start mapping logic (adapted from scanner.ts) --
    let projectName = repoUrl.split('/').pop()?.replace('.git', '') || 'GitHub Project';
    let framework = 'Next.js';

    // Parse package.json if exists
    const pkgFile = filesOnly.find(f => f.name === 'package.json' && !f.path.includes('/'));
    if (pkgFile) {
      try {
        const pkgContent = await fs.readFile(path.join(tempDir, pkgFile.path), 'utf-8');
        const pkg = JSON.parse(pkgContent);
        projectName = pkg.name || projectName;
        if (pkg.dependencies?.next) framework = `Next.js ${pkg.dependencies.next.replace(/[\^~]/, '')}`;
      } catch (e) { /* ignore */ }
    }

    const isAppRouter = filesOnly.some(f => f.path.startsWith('app/') || f.path.startsWith('src/app/'));
    const isPagesRouter = filesOnly.some(f => f.path.startsWith('pages/') || f.path.startsWith('src/pages/'));
    const appPrefix = isAppRouter
      ? (filesOnly.some(f => f.path.startsWith('src/app/')) ? 'src/app' : 'app')
      : (filesOnly.some(f => f.path.startsWith('src/pages/')) ? 'src/pages' : 'pages');

    const pageFiles = filesOnly.filter(f => {
      const p = f.path;
      if (!p.startsWith(appPrefix + '/')) return false;
      if (isAppRouter) return p.match(/\/(page|route)\.(tsx?|jsx?)$/);
      return p.match(/\.(tsx?|jsx?)$/) && !p.match(/\/_/) && !p.match(/\.(test|spec)\./);
    });

    const middlewareFile = filesOnly.find(f => f.name === 'middleware.ts' || f.name === 'middleware.js');
    const prismaFile = filesOnly.find(f => f.path.includes('prisma/schema.prisma') || f.path.includes('schema.prisma'));
    const authFiles = filesOnly.filter(f => f.path.includes('auth') && (f.path.includes('/api/') || f.name.includes('auth')));
    const componentDirs = filesOnly.filter(f => f.path.includes('/components/') || f.path.includes('/ui/') || f.path.includes('/shared/'));

    const nodes: Node<CanvasNodeData>[] = [];
    const edges: Edge<CanvasEdgeData>[] = [];
    let pagesCreated = 0;
    let apiCreated = 0;

    const pagesByDepth = new Map<number, typeof pageFiles>();
    for (const f of pageFiles) {
      const depth = f.path.split('/').length;
      const group = pagesByDepth.get(depth) || [];
      group.push(f);
      pagesByDepth.set(depth, group);
    }

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
          routePath: route, filePath: f.path, description: `${framework} ${nodeType === 'api' ? 'API route' : 'page'}: ${route}`
        }));
        if (isApi) apiCreated++; else pagesCreated++;
      }
    }

    for (const [childPath, childId] of fileToNodeId) {
      const parts = childPath.split('/');
      for (let i = parts.length - 2; i >= 1; i--) {
        const parentCandidates = [
          parts.slice(0, i + 1).join('/') + '/page.tsx',
          parts.slice(0, i + 1).join('/') + '/page.ts',
          parts.slice(0, i + 1).join('/') + '/page.jsx',
          parts.slice(0, i + 1).join('/') + '/index.tsx',
        ];
        const parentPath = parentCandidates.find(p => fileToNodeId.has(p));
        if (parentPath) {
          const parentId = fileToNodeId.get(parentPath)!;
          if (parentId !== childId) edges.push(makeEdge(parentId, childId, 'navigates-to', 'navigates to'));
          break;
        }
      }
    }

    const homePage = Array.from(fileToNodeId.entries()).find(([p]) => p === `${appPrefix}/page.tsx` || p === `${appPrefix}/index.tsx`);
    const loginPage = Array.from(fileToNodeId.entries()).find(([p]) => p.includes('/login/') || p.includes('/signin/') || p.includes('/auth/'));
    if (homePage && loginPage) {
      edges.push(makeEdge(homePage[1], loginPage[1], 'navigates-to', 'navigates to'));
    }

    let middlewareId = null;
    if (middlewareFile) {
      middlewareId = uuidv4();
      nodes.push(makeNode(middlewareId, 'middleware', 'Middleware', 'stable', { x: -300, y: 300 }, { filePath: middlewareFile.path, description: 'Route-level middleware' }));
      for (const [, nid] of fileToNodeId) { edges.push(makeEdge(middlewareId, nid, 'auth-guards', 'guards')); if (edges.length > 50) break; }
    }

    let prismaId = null;
    if (prismaFile) {
      prismaId = uuidv4();
      nodes.push(makeNode(prismaId, 'database', 'Database (Prisma)', 'stable', { x: 900, y: 500 }, { filePath: prismaFile.path, description: 'Prisma ORM' }));
      for (const [p, nid] of fileToNodeId) {
        if (p.includes('/api/')) edges.push(makeEdge(nid, prismaId, 'queries', 'queries'));
      }
    }

    const nextAuthFile = filesOnly.find(f => f.path.includes('nextauth') || f.path.includes('auth/route') || f.path.match(/auth\/\[/));
    if (nextAuthFile || authFiles.length > 0) {
      const authId = uuidv4();
      const authFilePath = nextAuthFile?.path || authFiles[0]?.path || '';
      nodes.push(makeNode(authId, 'auth', 'Auth', 'stable', { x: -300, y: 500 }, { filePath: authFilePath, description: 'Authentication provider' }));
      if (middlewareId) edges.push(makeEdge(middlewareId, authId, 'auth-guards', 'uses auth'));
      if (prismaId) edges.push(makeEdge(authId, prismaId, 'queries', 'queries users'));
    }

    // Clean up temporary directory to avoid massive storage impact
    // We run it async behind the response so it doesn't delay
    execAsync(`rmdir /s /q "${tempDir}"`).catch(console.error);

    return NextResponse.json({
      nodes,
      edges,
      meta: {
        projectName,
        framework,
        pages: pagesCreated,
        apiRoutes: apiCreated,
        components: componentDirs.length,
      }
    });

  } catch (error: any) {
    console.error('Scan GitHub Error:', error);
    return NextResponse.json({ error: error.message || 'Falha ao clonar ou mapear o repositório GitHub.' }, { status: 500 });
  }
}
