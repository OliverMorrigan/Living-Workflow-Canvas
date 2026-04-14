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
        height: '48px',
        background: 'hsl(222 18% 9%)',
        borderBottom: '1px solid hsl(220 14% 14%)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="#3b82f6" fillOpacity="0.8"/>
          <rect x="13" y="3" width="8" height="8" rx="2" fill="#8b5cf6" fillOpacity="0.8"/>
          <rect x="3" y="13" width="8" height="8" rx="2" fill="#10b981" fillOpacity="0.8"/>
          <rect x="13" y="13" width="8" height="8" rx="2" fill="#f59e0b" fillOpacity="0.8"/>
        </svg>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em', lineHeight: '1' }}>
            Living Canvas
          </div>
          <div style={{ fontSize: '9px', color: '#475569', fontFamily: 'monospace', lineHeight: '1.2' }}>
            {nodes.length} nodes · {edges.length} edges
          </div>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'hsl(220 14% 16%)' }} />

      {/* Snapshot input */}
      {showSnapshotInput ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            autoFocus
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSnapshot();
              if (e.key === 'Escape') {
                setShowSnapshotInput(false);
                setSnapshotName('');
              }
            }}
            placeholder="Snapshot name..."
            style={{
              background: 'hsl(220 14% 13%)',
              border: '1px solid hsl(217 91% 60% / 0.5)',
              borderRadius: '6px',
              padding: '4px 10px',
              color: '#e2e8f0',
              fontSize: '12px',
              outline: 'none',
              width: '180px',
              fontFamily: 'monospace',
            }}
          />
          <button
            onClick={handleSnapshot}
            style={{
              background: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 10px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            onClick={() => { setShowSnapshotInput(false); setSnapshotName(''); }}
            style={{
              background: 'transparent',
              border: '1px solid hsl(220 14% 22%)',
              borderRadius: '6px',
              padding: '5px 8px',
              color: '#64748b',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <ToolbarButton
            icon={
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 5V8.5L10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M1 8H3M13 8H15M8 1V3M8 13V15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            }
            label="Snapshot"
            onClick={handleSnapshot}
            accent="#60a5fa"
          />

          <ToolbarButton
            icon={
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 4V3C5 2.45 5.45 2 6 2H10C10.55 2 11 2.45 11 3V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M6 8H10M8 7V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            }
            label={`History (${snapshots.length})`}
            onClick={() => setSnapshotPanelOpen(!isSnapshotPanelOpen)}
            active={isSnapshotPanelOpen}
            accent="#a78bfa"
          />

          <div style={{ width: '1px', height: '24px', background: 'hsl(220 14% 16%)' }} />

          <button
            onClick={onGeneratePlan}
            disabled={isGeneratingPlan}
            style={{
              background: isGeneratingPlan
                ? 'rgba(139,92,246,0.15)'
                : 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '6px',
              padding: '5px 12px',
              color: '#c4b5fd',
              fontSize: '11px',
              fontWeight: 600,
              cursor: isGeneratingPlan ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {isGeneratingPlan ? (
              <>
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 15"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <path d="M2 10L6 6L9 9L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14H14V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ask Agent
              </>
            )}
          </button>
        </>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
        <button
          onClick={resetToSample}
          title="Reset to sample data"
          style={{
            background: 'transparent',
            border: '1px solid hsl(220 14% 20%)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: 'hsl(220 10% 40%)',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Reset
        </button>
        <div
          style={{
            background: 'hsl(220 14% 13%)',
            border: '1px solid hsl(220 14% 20%)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: 'hsl(220 10% 35%)',
            fontSize: '10px',
            fontFamily: 'monospace',
          }}
        >
          MVP v0.1
        </div>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  accent?: string;
}

function ToolbarButton({ icon, label, onClick, active, accent = '#60a5fa' }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${accent}22` : 'transparent',
        border: `1px solid ${active ? `${accent}44` : 'hsl(220 14% 20%)'}`,
        borderRadius: '6px',
        padding: '4px 10px',
        color: active ? accent : 'hsl(220 10% 55%)',
        fontSize: '11px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
