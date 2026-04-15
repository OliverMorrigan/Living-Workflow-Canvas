import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Toolbar from './components/Toolbar';
import LeftPalette from './components/LeftPalette';
import CanvasView from './components/CanvasView';
import InspectorPanel from './components/InspectorPanel';
import SnapshotPanel from './components/SnapshotPanel';
import PlanPanel from './components/PlanPanel';
import CommandBar from './components/CommandBar';
import { useCanvasStore } from './store/useCanvasStore';
import type { NodeType } from './types';
import { NODE_TYPE_CONFIGS } from './components/nodes/nodeConfig';
import { v4 as uuidv4 } from 'uuid';

const NODE_TYPES_LIST: NodeType[] = [
  'page', 'route', 'component', 'api', 'auth', 'middleware', 'database', 'gateway', 'ui-action',
];

function TypePickerOverlay({ onSelect, onClose }: { onSelect: (type: NodeType) => void; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#13151a',
          border: '1px solid #252830',
          borderRadius: '6px',
          padding: '8px 0',
          minWidth: '200px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '4px 12px 8px',
          fontSize: '8px',
          fontFamily: 'monospace',
          color: '#2e3340',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderBottom: '1px solid #1e2128',
          marginBottom: '4px',
        }}>
          Tipo do nó — pressione 1–9
        </div>
        {NODE_TYPES_LIST.map((type, i) => {
          const config = NODE_TYPE_CONFIGS[type];
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1a1d23'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#252830', width: '12px', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: config.accentColor, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppContent() {
  const {
    nodes,
    edges,
    selectedNodeId,
    removeNode,
    addNode,
    setSelectedNodeId,
    takeSnapshot,
    setGeneratedPlan,
    setPlanPanelOpen,
    setGeneratingPlan,
    isInspectorOpen,
    isCommandBarOpen,
    setCommandBarOpen,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasStore();

  const [showTypePicker, setShowTypePicker] = useState(false);

  const addNodeOfType = useCallback(
    (type: NodeType) => {
      const config = NODE_TYPE_CONFIGS[type];
      const id = uuidv4();
      addNode({
        id,
        type: 'canvasNode',
        position: { x: 300 + Math.random() * 300, y: 200 + Math.random() * 200 },
        data: {
          id,
          type,
          label: `New ${config.label}`,
          status: 'planned' as const,
          routePath: '',
          filePath: '',
          description: '',
          notes: '',
          prompt: '',
          tasks: [],
          bugs: [],
          attachments: [],
        },
      });
      setShowTypePicker(false);
    },
    [addNode]
  );

  const handleAutoSnapshot = useCallback(() => {
    const now = new Date();
    const name = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
    takeSnapshot(name);
  }, [takeSnapshot]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // ⌘K — Command Bar (always, even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(!isCommandBarOpen);
        return;
      }

      // Close command bar
      if (isCommandBarOpen && e.key === 'Escape') {
        e.preventDefault();
        setCommandBarOpen(false);
        return;
      }

      // Type picker shortcuts
      if (showTypePicker) {
        if (e.key === 'Escape') { e.preventDefault(); setShowTypePicker(false); return; }
        const idx = parseInt(e.key, 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < NODE_TYPES_LIST.length) {
          e.preventDefault();
          addNodeOfType(NODE_TYPES_LIST[idx]);
          return;
        }
        return;
      }

      if (isInput) return;

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canRedo()) redo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (canUndo()) undo();
        return;
      }

      // N — add node
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowTypePicker(true);
        return;
      }

      // Esc — deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNodeId(null);
        return;
      }

      // Del / Backspace — remove selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        removeNode(selectedNodeId);
        return;
      }

      // / — focus prompt in inspector
      if (e.key === '/' && selectedNodeId && isInspectorOpen) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-prompt'));
        return;
      }

      // F — fit view
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('flow:fitView'));
        return;
      }

      // 0 — zoom 100%
      if (e.key === '0') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('flow:zoomReset'));
        return;
      }

      // ⌘S — auto snapshot
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleAutoSnapshot();
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    showTypePicker,
    selectedNodeId,
    isInspectorOpen,
    isCommandBarOpen,
    addNodeOfType,
    removeNode,
    setSelectedNodeId,
    handleAutoSnapshot,
    setCommandBarOpen,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    setPlanPanelOpen(true);
    setGeneratedPlan(null);

    await new Promise((r) => setTimeout(r, 1200));

    const plan = generateCanvasPlan(nodes, edges, selectedNodeId);
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
        background: '#111216',
      }}
    >
      {showTypePicker && (
        <TypePickerOverlay
          onSelect={addNodeOfType}
          onClose={() => setShowTypePicker(false)}
        />
      )}
      <CommandBar />
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

function generateCanvasPlan(
  nodes: ReturnType<typeof useCanvasStore.getState>['nodes'],
  edges: ReturnType<typeof useCanvasStore.getState>['edges'],
  selectedNodeId: string | null
): string {
  const lines: string[] = [];
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const focusNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  lines.push('# Living Canvas — Plano de Mudanças');
  lines.push('');
  lines.push(`**Gerado em:** ${dateStr} às ${timeStr}`);
  lines.push(`**Escopo:** ${focusNode ? `Nó: ${focusNode.data.label}` : 'Canvas completo'}`);
  lines.push(`**Estado:** ${nodes.length} nós · ${edges.length} conexões`);
  lines.push('');

  const broken = nodes.filter((n) => n.data.status === 'broken');
  const inProgress = nodes.filter((n) => n.data.status === 'in-progress');
  const planned = nodes.filter((n) => n.data.status === 'planned');
  const allBugs = nodes.flatMap((n) =>
    (n.data.bugs || []).filter((b) => !b.resolved).map((b) => ({ ...b, node: n.data.label }))
  );
  const allTasks = nodes.flatMap((n) =>
    (n.data.tasks || []).filter((t) => !t.done).map((t) => ({ ...t, node: n.data.label }))
  );

  if (broken.length > 0) {
    lines.push('## Crítico — Nós Quebrados');
    broken.forEach((n) => {
      lines.push(`- **${n.data.label}** (\`${n.data.routePath || n.data.type}\`)`);
      (n.data.bugs || []).filter((b) => !b.resolved).forEach((b) =>
        lines.push(`  - [${b.severity.toUpperCase()}] ${b.text}`)
      );
    });
    lines.push('');
  }

  if (inProgress.length > 0) {
    lines.push('## Em Progresso');
    inProgress.forEach((n) => {
      lines.push(`- **${n.data.label}** (\`${n.data.routePath || n.data.filePath || n.data.type}\`)`);
      if (n.data.description) lines.push(`  ${n.data.description}`);
      (n.data.tasks || []).filter((t) => !t.done).forEach((t) => lines.push(`  - [ ] ${t.text}`));
    });
    lines.push('');
  }

  if (planned.length > 0) {
    lines.push('## Planejado');
    planned.forEach((n) => {
      lines.push(`- **${n.data.label}** (\`${n.data.routePath || n.data.type}\`)`);
    });
    lines.push('');
  }

  const withPrompts = nodes.filter((n) => n.data.prompt);
  if (withPrompts.length > 0) {
    lines.push('## Intenções por Nó');
    withPrompts.forEach((n) => {
      lines.push(`### ${n.data.label}`);
      lines.push(n.data.prompt || '');
      lines.push('');
    });
  }

  lines.push('## Mapa de Arquitetura');
  lines.push('');
  const typeGroups: Record<string, string[]> = {};
  nodes.forEach((n) => {
    if (!typeGroups[n.data.type]) typeGroups[n.data.type] = [];
    typeGroups[n.data.type].push(n.data.label);
  });
  Object.entries(typeGroups).forEach(([type, labels]) => {
    lines.push(`**${type.charAt(0).toUpperCase() + type.slice(1)}s:** ${labels.join(', ')}`);
  });
  lines.push('');

  lines.push('## Conexões');
  edges.forEach((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    const rel = (e.data as { label?: string })?.label || 'conecta a';
    if (src && tgt) lines.push(`- **${src.data.label}** ${rel} **${tgt.data.label}**`);
  });
  lines.push('');

  if (allBugs.length > 0) {
    lines.push('## Bugs Abertos');
    const sorted = [...allBugs.filter((b) => b.severity === 'high'), ...allBugs.filter((b) => b.severity === 'medium'), ...allBugs.filter((b) => b.severity === 'low')];
    sorted.forEach((b) => lines.push(`- [${b.severity.toUpperCase()}] **${b.node}**: ${b.text}`));
    lines.push('');
  }

  if (allTasks.length > 0) {
    lines.push('## Tarefas Pendentes');
    allTasks.forEach((t) => lines.push(`- [ ] **${t.node}**: ${t.text}`));
    lines.push('');
  }

  lines.push('## Instruções para o Agente');
  lines.push('');
  lines.push('1. **Comece pelos nós quebrados** — prioridade máxima');
  lines.push('2. **Siga as conexões** — mudanças se propagam pelas arestas');
  lines.push('3. **Respeite as intenções** — cada nó tem seu prompt/intenção declarada');
  lines.push('4. **Snapshot após cada mudança** — registre o progresso');
  lines.push('');
  lines.push('> Gerado pelo Living Software Canvas. Valide contra o codebase antes de implementar.');

  return lines.join('\n');
}
