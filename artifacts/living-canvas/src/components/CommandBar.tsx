import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { NODE_TYPE_CONFIGS } from './nodes/nodeConfig';
import type { NodeType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const NODE_TYPES: NodeType[] = [
  'page', 'route', 'component', 'api', 'auth', 'middleware', 'database', 'gateway', 'ui-action',
];

type ResultItem =
  | { kind: 'node'; id: string; label: string; type: NodeType; status: string }
  | { kind: 'action'; id: string; label: string; description: string; icon: string; run: () => void };

export default function CommandBar() {
  const {
    nodes,
    isCommandBarOpen,
    setCommandBarOpen,
    setSelectedNodeId,
    addNode,
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasStore();

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandBarOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isCommandBarOpen]);

  const close = useCallback(() => {
    setCommandBarOpen(false);
  }, [setCommandBarOpen]);

  const addNodeOfType = useCallback(
    (type: NodeType) => {
      const config = NODE_TYPE_CONFIGS[type];
      const id = uuidv4();
      addNode({
        id,
        type: 'canvasNode',
        position: { x: 300 + Math.random() * 400, y: 150 + Math.random() * 300 },
        data: {
          id,
          type,
          label: `New ${config.label}`,
          status: 'planned',
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
      close();
    },
    [addNode, close]
  );

  const results: ResultItem[] = [];
  const q = query.trim().toLowerCase();

  if (!q) {
    // Default: recent nodes + common actions
    nodes.slice(0, 6).forEach((n) =>
      results.push({ kind: 'node', id: n.id, label: n.data.label, type: n.data.type, status: n.data.status })
    );
    results.push({
      kind: 'action', id: 'fit', label: 'Fit view', description: 'Centralizar canvas', icon: '⊞',
      run: () => { window.dispatchEvent(new CustomEvent('flow:fitView')); close(); },
    });
    results.push({
      kind: 'action', id: 'snapshot', label: 'Criar snapshot', description: '⌘S', icon: '◈',
      run: () => {
        const now = new Date();
        takeSnapshot(now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''));
        close();
      },
    });
    if (canUndo()) results.push({
      kind: 'action', id: 'undo', label: 'Desfazer', description: '⌘Z', icon: '↩',
      run: () => { undo(); close(); },
    });
    if (canRedo()) results.push({
      kind: 'action', id: 'redo', label: 'Refazer', description: '⌘⇧Z', icon: '↪',
      run: () => { redo(); close(); },
    });
  } else {
    // Search nodes by label, type, status
    nodes.forEach((n) => {
      if (
        n.data.label.toLowerCase().includes(q) ||
        n.data.type.toLowerCase().includes(q) ||
        n.data.status.toLowerCase().includes(q) ||
        (n.data.routePath || '').toLowerCase().includes(q) ||
        (n.data.filePath || '').toLowerCase().includes(q)
      ) {
        results.push({ kind: 'node', id: n.id, label: n.data.label, type: n.data.type, status: n.data.status });
      }
    });

    // Add node by type
    NODE_TYPES.forEach((type) => {
      const config = NODE_TYPE_CONFIGS[type];
      if (config.label.toLowerCase().includes(q) || `add ${type}`.includes(q) || `new ${type}`.includes(q)) {
        results.push({
          kind: 'action',
          id: `add-${type}`,
          label: `Adicionar ${config.label}`,
          description: `Novo nó do tipo ${config.label}`,
          icon: '+',
          run: () => addNodeOfType(type),
        });
      }
    });

    if (!results.length) {
      // Always offer to add any node type
      NODE_TYPES.slice(0, 4).forEach((type) => {
        const config = NODE_TYPE_CONFIGS[type];
        results.push({
          kind: 'action',
          id: `add-${type}`,
          label: `Adicionar ${config.label}`,
          description: `Novo nó`,
          icon: '+',
          run: () => addNodeOfType(type),
        });
      });
    }
  }

  const clampedIdx = Math.min(activeIdx, results.length - 1);

  const executeItem = useCallback(
    (item: ResultItem) => {
      if (item.kind === 'node') {
        setSelectedNodeId(item.id);
        window.dispatchEvent(new CustomEvent('flow:focusNode', { detail: { id: item.id } }));
        close();
      } else {
        item.run();
      }
    },
    [setSelectedNodeId, close]
  );

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[clampedIdx]) {
        e.preventDefault();
        executeItem(results[clampedIdx]);
      }
    },
    [results, clampedIdx, executeItem, close]
  );

  if (!isCommandBarOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        background: 'rgba(7, 8, 10, 0.7)',
      }}
      onClick={close}
    >
      <div
        style={{
          background: '#13151a',
          border: '1px solid #252830',
          borderRadius: '8px',
          width: '520px',
          maxHeight: '420px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid #1e2128' }}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ color: '#3d4455', flexShrink: 0 }}>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar nós, ações, tipos..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#dde3ed',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
          />
          <kbd style={{
            fontSize: '9px',
            color: '#2e3340',
            background: '#1a1d23',
            border: '1px solid #252830',
            borderRadius: '3px',
            padding: '1px 5px',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {!q && (
            <div style={{ padding: '6px 14px 2px', fontSize: '8px', color: '#2e3340', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Nós recentes
            </div>
          )}
          {results.map((item, idx) => {
            const isActive = idx === clampedIdx;
            if (item.kind === 'node') {
              const config = NODE_TYPE_CONFIGS[item.type];
              return (
                <button
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 14px',
                    background: isActive ? '#1a1d23' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '1px', background: config.accentColor, borderLeft: `3px solid ${config.accentColor}`, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#dde3ed', flex: 1, fontFamily: 'monospace' }}>{item.label}</span>
                  <span style={{ fontSize: '9px', color: '#3d4455', fontFamily: 'monospace', textTransform: 'uppercase' }}>{item.type}</span>
                  {isActive && (
                    <kbd style={{ fontSize: '9px', color: '#3d4455', background: '#252830', border: '1px solid #363b48', borderRadius: '2px', padding: '1px 4px' }}>↵</kbd>
                  )}
                </button>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setActiveIdx(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 14px',
                  background: isActive ? '#1a1d23' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ width: 16, textAlign: 'center', fontSize: '11px', color: '#4b5563', flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#dde3ed', fontFamily: 'monospace' }}>{item.label}</div>
                  {item.description && (
                    <div style={{ fontSize: '10px', color: '#3d4455', marginTop: '1px' }}>{item.description}</div>
                  )}
                </div>
                {isActive && (
                  <kbd style={{ fontSize: '9px', color: '#3d4455', background: '#252830', border: '1px solid #363b48', borderRadius: '2px', padding: '1px 4px' }}>↵</kbd>
                )}
              </button>
            );
          })}
          {results.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#2e3340', fontSize: '12px', fontFamily: 'monospace' }}>
              Nenhum resultado para "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #1e2128',
          padding: '6px 14px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
        }}>
          {[['↑↓', 'navegar'], ['↵', 'abrir'], ['Esc', 'fechar']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ fontSize: '8px', color: '#2e3340', background: '#1a1d23', border: '1px solid #252830', borderRadius: '2px', padding: '0 4px', fontFamily: 'monospace' }}>{key}</kbd>
              <span style={{ fontSize: '9px', color: '#1e2128' }}>{label}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '9px', color: '#1e2128', fontFamily: 'monospace' }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
