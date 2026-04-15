import React, { useState } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

interface ToolbarProps {
  onGeneratePlan: () => void;
}

export default function Toolbar({ onGeneratePlan }: ToolbarProps) {
  const {
    takeSnapshot,
    setSnapshotPanelOpen,
    isSnapshotPanelOpen,
    snapshots,
    resetToSample,
    nodes,
    edges,
    isGeneratingPlan,
    undo,
    redo,
    canUndo,
    canRedo,
    setCommandBarOpen,
  } = useCanvasStore();

  const [showSnapshotInput, setShowSnapshotInput] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  const handleSnapshot = () => {
    if (showSnapshotInput) {
      if (snapshotName.trim()) {
        takeSnapshot(snapshotName.trim());
        setSnapshotName('');
        setShowSnapshotInput(false);
      }
    } else {
      setShowSnapshotInput(true);
    }
  };

  return (
    <div
      style={{
        height: '40px',
        background: '#13151a',
        borderBottom: '1px solid #1e2128',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '4px',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginRight: '6px' }}>
        <div style={{
          width: 16, height: 16, borderRadius: '3px',
          background: '#1e2128', border: '1px solid #252830',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '1px', background: '#3b82f6' }} />
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8b95a5', lineHeight: '1', letterSpacing: '-0.01em' }}>
            Living Canvas
          </div>
          <div style={{ fontSize: '8px', color: '#2e3340', fontFamily: 'monospace', lineHeight: '1.2', marginTop: '1px' }}>
            {nodes.length}n · {edges.length}e
          </div>
        </div>
      </div>

      <div style={{ width: '1px', height: '18px', background: '#1e2128' }} />

      {/* ⌘K button */}
      <button
        onClick={() => setCommandBarOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: '#1a1d23', border: '1px solid #252830', borderRadius: '4px',
          padding: '3px 8px', color: '#4b5563', fontSize: '10px',
          fontFamily: 'monospace', cursor: 'pointer', marginRight: '2px',
        }}
        title="Command Bar (⌘K)"
      >
        <svg viewBox="0 0 16 16" fill="none" width="10" height="10">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ color: '#2e3340' }}>⌘K</span>
      </button>

      {/* Undo / Redo */}
      <button
        onClick={() => canUndo() && undo()}
        disabled={!canUndo()}
        title="Desfazer (⌘Z)"
        style={{
          background: 'transparent', border: 'none', padding: '4px 5px',
          color: canUndo() ? '#4b5563' : '#1e2128', cursor: canUndo() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center',
        }}
      >
        <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
          <path d="M3 7C3 4.8 4.8 3 7 3C9.2 3 11 4.8 11 7C11 9.2 9.2 11 7 11H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M5.5 9L3 11L5.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        onClick={() => canRedo() && redo()}
        disabled={!canRedo()}
        title="Refazer (⌘⇧Z)"
        style={{
          background: 'transparent', border: 'none', padding: '4px 5px',
          color: canRedo() ? '#4b5563' : '#1e2128', cursor: canRedo() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', marginRight: '4px',
        }}
      >
        <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
          <path d="M13 7C13 4.8 11.2 3 9 3C6.8 3 5 4.8 5 7C5 9.2 6.8 11 9 11H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M10.5 9L13 11L10.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div style={{ width: '1px', height: '18px', background: '#1e2128' }} />

      {/* Snapshot input or buttons */}
      {showSnapshotInput ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            autoFocus
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSnapshot();
              if (e.key === 'Escape') { setShowSnapshotInput(false); setSnapshotName(''); }
            }}
            placeholder="Nome do snapshot..."
            style={{
              background: '#1a1d23', border: '1px solid #252830', borderRadius: '4px',
              padding: '3px 8px', color: '#c8d0dc', fontSize: '11px',
              outline: 'none', width: '160px', fontFamily: 'monospace',
            }}
          />
          <FlatButton onClick={handleSnapshot} label="Salvar" />
          <FlatButton onClick={() => { setShowSnapshotInput(false); setSnapshotName(''); }} label="×" />
        </div>
      ) : (
        <>
          <FlatButton onClick={handleSnapshot} label="Snapshot" />
          <FlatButton
            onClick={() => setSnapshotPanelOpen(!isSnapshotPanelOpen)}
            label={snapshots.length > 0 ? `Histórico (${snapshots.length})` : 'Histórico'}
            active={isSnapshotPanelOpen}
          />

          <div style={{ width: '1px', height: '18px', background: '#1e2128', marginLeft: '4px' }} />

          <button
            onClick={onGeneratePlan}
            disabled={isGeneratingPlan}
            style={{
              background: 'transparent', border: '1px solid #252830', borderRadius: '4px',
              padding: '3px 10px', color: isGeneratingPlan ? '#3d4455' : '#6b7280',
              fontSize: '10px', fontFamily: 'monospace',
              cursor: isGeneratingPlan ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px',
            }}
          >
            {isGeneratingPlan ? (
              <>
                <svg viewBox="0 0 16 16" fill="none" width="10" height="10" className="spin">
                  <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 15"/>
                </svg>
                Gerando...
              </>
            ) : 'Ask Agent'}
          </button>
        </>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}>
        <button
          onClick={resetToSample}
          title="Resetar para dados de exemplo"
          style={{
            background: 'transparent', border: 'none', padding: '3px 6px',
            color: '#2e3340', fontSize: '9px', cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          Reset
        </button>
        <div style={{ padding: '2px 6px', color: '#1e2128', fontSize: '9px', fontFamily: 'monospace' }}>v0.2</div>
      </div>
    </div>
  );
}

function FlatButton({ onClick, label, active }: { onClick: () => void; label: string; active?: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? '#1a1d23' : hovered ? '#1a1d23' : 'transparent',
        border: `1px solid ${active || hovered ? '#252830' : 'transparent'}`,
        borderRadius: '4px', padding: '3px 8px',
        color: active ? '#8b95a5' : hovered ? '#6b7280' : '#3d4455',
        fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
