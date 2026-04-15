import React, { useState } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import type { Snapshot } from '../types';

export default function SnapshotPanel() {
  const {
    snapshots,
    deleteSnapshot,
    restoreSnapshot,
    getSnapshotDiff,
    isSnapshotPanelOpen,
    setSnapshotPanelOpen,
    compareSnapshot1,
    compareSnapshot2,
    setCompareSnapshot1,
    setCompareSnapshot2,
  } = useCanvasStore();

  const [view, setView] = useState<'list' | 'compare'>('list');

  if (!isSnapshotPanelOpen) return null;

  const diff = compareSnapshot1 && compareSnapshot2
    ? getSnapshotDiff(compareSnapshot1, compareSnapshot2)
    : null;

  const snap1 = snapshots.find((s) => s.id === compareSnapshot1);
  const snap2 = snapshots.find((s) => s.id === compareSnapshot2);

  const totalChanges = diff
    ? diff.nodesAdded.length + diff.nodesRemoved.length + diff.nodesChanged.length +
      diff.edgesAdded.length + diff.edgesRemoved.length + diff.edgesChanged.length
    : 0;

  return (
    <div
      className="panel-animate"
      style={{
        width: '280px',
        height: '100%',
        background: 'hsl(222 18% 9%)',
        borderLeft: '1px solid hsl(220 14% 14%)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid hsl(220 14% 14%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Snapshots</div>
          <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', marginTop: '1px' }}>
            {snapshots.length} saved
          </div>
        </div>
        <button
          onClick={() => setSnapshotPanelOpen(false)}
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
        >
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* View toggle */}
      <div
        style={{
          display: 'flex',
          padding: '8px 14px',
          gap: '4px',
          borderBottom: '1px solid hsl(220 14% 14%)',
        }}
      >
        <TabButton active={view === 'list'} onClick={() => setView('list')}>History</TabButton>
        <TabButton active={view === 'compare'} onClick={() => setView('compare')}>
          Compare
          {diff && totalChanges > 0 && (
            <span style={{ marginLeft: '4px', background: '#f59e0b22', color: '#f59e0b', borderRadius: '3px', padding: '0 4px', fontSize: '9px' }}>
              {totalChanges}
            </span>
          )}
        </TabButton>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px' }}>
        {view === 'list' && (
          <>
            {snapshots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#334155', fontSize: '12px' }}>
                <div style={{ marginBottom: '8px', fontSize: '24px' }}>📷</div>
                <div>No snapshots yet.</div>
                <div style={{ marginTop: '4px', color: '#1e293b', fontSize: '11px' }}>
                  Use the Snapshot button to save the current state.
                </div>
              </div>
            ) : (
              snapshots.map((snap, i) => (
                <SnapshotCard
                  key={snap.id}
                  snapshot={snap}
                  index={snapshots.length - i}
                  isSelected1={compareSnapshot1 === snap.id}
                  isSelected2={compareSnapshot2 === snap.id}
                  onSelect1={() => setCompareSnapshot1(compareSnapshot1 === snap.id ? null : snap.id)}
                  onSelect2={() => setCompareSnapshot2(compareSnapshot2 === snap.id ? null : snap.id)}
                  onDelete={() => deleteSnapshot(snap.id)}
                  onRestore={() => restoreSnapshot(snap.id)}
                />
              ))
            )}
          </>
        )}

        {view === 'compare' && (
          <CompareView
            snap1={snap1}
            snap2={snap2}
            diff={diff}
            snapshots={snapshots}
            compareSnapshot1={compareSnapshot1}
            compareSnapshot2={compareSnapshot2}
            setCompareSnapshot1={setCompareSnapshot1}
            setCompareSnapshot2={setCompareSnapshot2}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px',
        borderRadius: '6px',
        border: `1px solid ${active ? '#3b82f644' : 'hsl(220 14% 20%)'}`,
        background: active ? '#3b82f622' : 'transparent',
        color: active ? '#60a5fa' : '#475569',
        fontSize: '11px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {children}
    </button>
  );
}

function SnapshotCard({
  snapshot, index, isSelected1, isSelected2, onSelect1, onSelect2, onDelete, onRestore,
}: {
  snapshot: Snapshot;
  index: number;
  isSelected1: boolean;
  isSelected2: boolean;
  onSelect1: () => void;
  onSelect2: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const date = new Date(snapshot.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div
      style={{
        background: 'hsl(222 18% 12%)',
        border: `1px solid ${isSelected1 || isSelected2 ? '#3b82f644' : 'hsl(220 14% 16%)'}`,
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px' }}>
            {snapshot.name}
          </div>
          <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#475569' }}>
            {dateStr} · {timeStr} · #{index}
          </div>
          <div style={{ fontSize: '10px', color: '#334155', marginTop: '4px' }}>
            {snapshot.nodes.length} nodes, {snapshot.edges.length} edges
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              onClick={onSelect1}
              title="Compare as A"
              style={{
                padding: '3px 6px',
                borderRadius: '4px',
                border: `1px solid ${isSelected1 ? '#60a5fa' : 'hsl(220 14% 22%)'}`,
                background: isSelected1 ? '#3b82f622' : 'transparent',
                color: isSelected1 ? '#60a5fa' : '#475569',
                fontSize: '9px',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              A
            </button>
            <button
              onClick={onSelect2}
              title="Compare as B"
              style={{
                padding: '3px 6px',
                borderRadius: '4px',
                border: `1px solid ${isSelected2 ? '#a78bfa' : 'hsl(220 14% 22%)'}`,
                background: isSelected2 ? '#8b5cf622' : 'transparent',
                color: isSelected2 ? '#a78bfa' : '#475569',
                fontSize: '9px',
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              B
            </button>
          </div>
        </div>
      </div>
      {snapshot.description && (
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px', fontStyle: 'italic' }}>
          {snapshot.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
        <button
          onClick={onRestore}
          style={{
            flex: 1,
            padding: '4px',
            borderRadius: '5px',
            border: '1px solid hsl(220 14% 20%)',
            background: 'transparent',
            color: '#64748b',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          Restore
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '4px 8px',
            borderRadius: '5px',
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'transparent',
            color: '#ef4444',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function CompareView({
  snap1, snap2, diff, snapshots, compareSnapshot1, compareSnapshot2, setCompareSnapshot1, setCompareSnapshot2,
}: {
  snap1?: Snapshot;
  snap2?: Snapshot;
  diff: ReturnType<typeof useCanvasStore.getState.prototype.getSnapshotDiff> | null;
  snapshots: Snapshot[];
  compareSnapshot1: string | null;
  compareSnapshot2: string | null;
  setCompareSnapshot1: (id: string | null) => void;
  setCompareSnapshot2: (id: string | null) => void;
}) {
  if (snapshots.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#334155', fontSize: '12px' }}>
        <div style={{ marginBottom: '8px' }}>Need at least 2 snapshots to compare.</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        <SnapSelect
          label="A (older)"
          value={compareSnapshot1}
          onChange={setCompareSnapshot1}
          snapshots={snapshots}
          color="#60a5fa"
        />
        <div style={{ margin: '6px 0', textAlign: 'center', color: '#334155', fontSize: '16px' }}>→</div>
        <SnapSelect
          label="B (newer)"
          value={compareSnapshot2}
          onChange={setCompareSnapshot2}
          snapshots={snapshots}
          color="#a78bfa"
        />
      </div>

      {!snap1 || !snap2 ? (
        <div style={{ color: '#334155', fontSize: '11px', textAlign: 'center', padding: '16px 0' }}>
          Select two snapshots to compare
        </div>
      ) : !diff ? (
        <div style={{ color: '#334155', fontSize: '11px', textAlign: 'center', padding: '16px 0' }}>
          Loading diff...
        </div>
      ) : (
        <DiffView diff={diff} />
      )}
    </>
  );
}

function SnapSelect({
  label, value, onChange, snapshots, color,
}: {
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
  snapshots: Snapshot[];
  color: string;
}) {
  return (
    <div>
      <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
        <span style={{ color }}>{label}</span>
      </div>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        style={{
          width: '100%',
          background: 'hsl(222 18% 12%)',
          border: `1px solid ${value ? `${color}44` : 'hsl(220 14% 18%)'}`,
          borderRadius: '6px',
          padding: '6px 8px',
          color: value ? '#e2e8f0' : '#475569',
          fontSize: '11px',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'monospace',
        }}
      >
        <option value="">Select snapshot...</option>
        {snapshots.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({new Date(s.timestamp).toLocaleDateString()})
          </option>
        ))}
      </select>
    </div>
  );
}

function DiffView({ diff }: { diff: NonNullable<ReturnType<typeof useCanvasStore.getState.prototype.getSnapshotDiff>> }) {
  const hasChanges = [
    ...diff.nodesAdded, ...diff.nodesRemoved, ...diff.nodesChanged,
    ...diff.edgesAdded, ...diff.edgesRemoved, ...diff.edgesChanged,
  ].length > 0;

  if (!hasChanges) {
    return (
      <div
        style={{
          padding: '16px',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '8px',
          color: '#22c55e',
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        No changes between these snapshots
      </div>
    );
  }

  return (
    <div>
      <DiffSection title="Nodes Added" items={diff.nodesAdded} color="#22c55e" icon="+" />
      <DiffSection title="Nodes Removed" items={diff.nodesRemoved} color="#ef4444" icon="−" />
      <DiffSection title="Nodes Changed" items={diff.nodesChanged} color="#f59e0b" icon="~" />
      <DiffSection title="Edges Added" items={diff.edgesAdded} color="#22c55e" icon="+" />
      <DiffSection title="Edges Removed" items={diff.edgesRemoved} color="#ef4444" icon="−" />
      <DiffSection title="Edges Changed" items={diff.edgesChanged} color="#f59e0b" icon="~" />
    </div>
  );
}

function DiffSection({ title, items, color, icon }: { title: string; items: string[]; color: string; icon: string }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
        {title}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            padding: '4px 8px',
            background: `${color}0d`,
            border: `1px solid ${color}22`,
            borderRadius: '5px',
            marginBottom: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ color, fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>{icon}</span>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{item}</span>
        </div>
      ))}
    </div>
  );
}
