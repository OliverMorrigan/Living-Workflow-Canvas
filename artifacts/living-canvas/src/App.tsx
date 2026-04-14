import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Toolbar from './components/Toolbar';
import LeftPalette from './components/LeftPalette';
import CanvasView from './components/CanvasView';
import InspectorPanel from './components/InspectorPanel';
import SnapshotPanel from './components/SnapshotPanel';
import PlanPanel from './components/PlanPanel';
import { useCanvasStore } from './store/useCanvasStore';

function AppContent() {
  const {
    nodes,
    edges,
    setGeneratedPlan,
    setPlanPanelOpen,
    setGeneratingPlan,
    isGeneratingPlan,
    selectedNodeId,
  } = useCanvasStore();

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    setPlanPanelOpen(true);
    setGeneratedPlan(null);

    await new Promise((r) => setTimeout(r, 1200));

    const plan = generateFullCanvasPlan(nodes, edges, selectedNodeId);
    setGeneratedPlan(plan);
    setGeneratingPlan(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'hsl(222 20% 7%)',
      }}
    >
      <Toolbar onGeneratePlan={handleGeneratePlan} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftPalette />
        <CanvasView />
        <SnapshotPanel />
        <InspectorPanel />
        <PlanPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

function generateFullCanvasPlan(
  nodes: ReturnType<typeof useCanvasStore.getState>['nodes'],
  edges: ReturnType<typeof useCanvasStore.getState>['edges'],
  selectedNodeId: string | null
): string {
  const lines: string[] = [];
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const focusNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  lines.push('# Living Canvas — Agent-Ready Change Plan');
  lines.push('');
  lines.push(`**Generated:** ${dateStr} at ${timeStr}`);
  lines.push(`**Scope:** ${focusNode ? `Node: ${focusNode.data.label}` : 'Full Canvas'}`);
  lines.push(`**Canvas State:** ${nodes.length} nodes, ${edges.length} edges`);
  lines.push('');

  const inProgress = nodes.filter((n) => n.data.status === 'in-progress');
  const broken = nodes.filter((n) => n.data.status === 'broken');
  const planned = nodes.filter((n) => n.data.status === 'planned');
  const allBugs = nodes.flatMap((n) => (n.data.bugs || []).filter((b) => !b.resolved).map((b) => ({ ...b, node: n.data.label })));
  const allTasks = nodes.flatMap((n) => (n.data.tasks || []).filter((t) => !t.done).map((t) => ({ ...t, node: n.data.label })));

  if (broken.length > 0) {
    lines.push('## Critical — Broken Nodes');
    broken.forEach((n) => {
      lines.push(`- **${n.data.label}** (\`${n.data.routePath || n.data.type}\`) — requires immediate attention`);
      const nodeBugs = (n.data.bugs || []).filter((b) => !b.resolved);
      if (nodeBugs.length > 0) {
        nodeBugs.forEach((b) => lines.push(`  - [${b.severity.toUpperCase()}] ${b.text}`));
      }
    });
    lines.push('');
  }

  if (inProgress.length > 0) {
    lines.push('## In Progress');
    inProgress.forEach((n) => {
      lines.push(`- **${n.data.label}** (\`${n.data.routePath || n.data.filePath || n.data.type}\`)`);
      if (n.data.description) lines.push(`  ${n.data.description}`);
      const nodeTasks = (n.data.tasks || []).filter((t) => !t.done);
      if (nodeTasks.length > 0) {
        nodeTasks.forEach((t) => lines.push(`  - [ ] ${t.text}`));
      }
    });
    lines.push('');
  }

  if (planned.length > 0) {
    lines.push('## Planned (Not Yet Built)');
    planned.forEach((n) => {
      lines.push(`- **${n.data.label}** (\`${n.data.routePath || n.data.type}\`)`);
      if (n.data.description) lines.push(`  ${n.data.description}`);
    });
    lines.push('');
  }

  lines.push('## Architecture Overview');
  lines.push('');

  const typeGroups: Record<string, string[]> = {};
  nodes.forEach((n) => {
    const type = n.data.type;
    if (!typeGroups[type]) typeGroups[type] = [];
    typeGroups[type].push(n.data.label);
  });

  Object.entries(typeGroups).forEach(([type, labels]) => {
    lines.push(`**${type.charAt(0).toUpperCase() + type.slice(1)}s:** ${labels.join(', ')}`);
  });
  lines.push('');

  lines.push('## Connection Map');
  edges.forEach((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    const rel = (e.data as { label?: string })?.label || 'connects to';
    if (src && tgt) {
      lines.push(`- **${src.data.label}** ${rel} **${tgt.data.label}**`);
    }
  });
  lines.push('');

  if (allBugs.length > 0) {
    lines.push('## Open Bugs Summary');
    const high = allBugs.filter((b) => b.severity === 'high');
    const med = allBugs.filter((b) => b.severity === 'medium');
    const low = allBugs.filter((b) => b.severity === 'low');
    [...high, ...med, ...low].forEach((b) => {
      lines.push(`- [${b.severity.toUpperCase()}] **${b.node}**: ${b.text}`);
    });
    lines.push('');
  }

  if (allTasks.length > 0) {
    lines.push('## Pending Tasks Summary');
    allTasks.forEach((t) => {
      lines.push(`- [ ] **${t.node}**: ${t.text}`);
    });
    lines.push('');
  }

  lines.push('## Agent Instructions');
  lines.push('');
  lines.push('This plan was generated from a Living Canvas snapshot. When implementing:');
  lines.push('');
  lines.push('1. **Start with broken nodes** — resolve critical issues before new features');
  lines.push('2. **Follow the connection map** — changes propagate through edges; test downstream effects');
  lines.push('3. **Coordinate in-progress nodes** — check with the team before structural changes');
  lines.push('4. **Validate planned nodes** — confirm file paths and routes before creating new files');
  lines.push('5. **Run a new snapshot** after each significant change to track delta');
  lines.push('');
  lines.push('> This plan was generated by Living Software Canvas. It reflects intent, not ground truth.');
  lines.push('> Always verify against the actual codebase before implementing changes.');

  return lines.join('\n');
}
