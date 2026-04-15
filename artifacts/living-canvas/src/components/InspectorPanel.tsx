import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CanvasNodeData, NodeStatus, Task, Bug } from '../types';
import { useCanvasStore } from '../store/useCanvasStore';
import { NODE_TYPE_CONFIGS, STATUS_CONFIGS } from './nodes/nodeConfig';
import { v4 as uuidv4 } from 'uuid';

function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  style,
  textareaRef,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef || internalRef;

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [ref]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => { onChange(e.target.value); resize(); }}
      placeholder={placeholder}
      rows={1}
      style={{
        ...style,
        overflow: 'hidden',
        resize: 'none',
      }}
    />
  );
}

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: '9px',
  fontFamily: 'monospace',
  color: '#3d4455',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '5px',
};

const FIELD_STYLE: React.CSSProperties = {
  marginBottom: '16px',
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: '#141618',
  border: '1px solid #252830',
  borderRadius: '4px',
  padding: '6px 8px',
  color: '#c8d0dc',
  fontSize: '12px',
  outline: 'none',
  fontFamily: 'monospace',
  resize: 'none',
  lineHeight: '1.5',
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  minHeight: '36px',
};

export default function InspectorPanel() {
  const { nodes, selectedNodeId, updateNodeData, removeNode, setInspectorOpen, isInspectorOpen } =
    useCanvasStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [newTask, setNewTask] = useState('');
  const [newBug, setNewBug] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<Bug['severity']>('medium');
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.type === 'focus-prompt') {
        promptRef.current?.focus();
      }
    };
    window.addEventListener('focus-prompt', handler as EventListener);
    return () => window.removeEventListener('focus-prompt', handler as EventListener);
  }, []);

  if (!isInspectorOpen || !node) return null;

  const data = node.data;
  const typeConfig = NODE_TYPE_CONFIGS[data.type] || NODE_TYPE_CONFIGS.page;
  const statusConfig = STATUS_CONFIGS[data.status] || STATUS_CONFIGS.stable;

  const update = (patch: Partial<CanvasNodeData>) => updateNodeData(node.id, patch);

  const addTask = () => {
    if (!newTask.trim()) return;
    update({ tasks: [...(data.tasks || []), { id: uuidv4(), text: newTask.trim(), done: false }] });
    setNewTask('');
  };

  const toggleTask = (id: string) =>
    update({ tasks: data.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });

  const removeTask = (id: string) =>
    update({ tasks: data.tasks.filter((t) => t.id !== id) });

  const addBug = () => {
    if (!newBug.trim()) return;
    update({
      bugs: [...(data.bugs || []), { id: uuidv4(), text: newBug.trim(), severity: newBugSeverity, resolved: false }],
    });
    setNewBug('');
  };

  const toggleBug = (id: string) =>
    update({ bugs: data.bugs.map((b) => (b.id === id ? { ...b, resolved: !b.resolved } : b)) });

  const removeBug = (id: string) =>
    update({ bugs: data.bugs.filter((b) => b.id !== id) });

  const openBugs = data.bugs?.filter((b) => !b.resolved) || [];
  const resolvedBugs = data.bugs?.filter((b) => b.resolved) || [];
  const pendingTasks = data.tasks?.filter((t) => !t.done) || [];
  const doneTasks = data.tasks?.filter((t) => t.done) || [];

  return (
    <div
      style={{
        width: '300px',
        height: '100%',
        background: '#13151a',
        borderLeft: '1px solid #1e2128',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #1e2128',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: 3,
            height: 28,
            borderRadius: '2px',
            background: typeConfig.accentColor,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <input
            value={data.label}
            onChange={(e) => update({ label: e.target.value })}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#dde3ed',
              fontSize: '13px',
              fontWeight: 600,
              width: '100%',
              padding: 0,
            }}
          />
          <div
            style={{
              fontSize: '9px',
              color: typeConfig.accentColor,
              fontFamily: 'monospace',
              marginTop: '1px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.8,
            }}
          >
            {typeConfig.label}
          </div>
        </div>
        <button
          onClick={() => setInspectorOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3d4455',
            cursor: 'pointer',
            padding: '3px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Status row */}
      <div
        style={{
          padding: '7px 12px',
          borderBottom: '1px solid #1e2128',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusConfig.color, flexShrink: 0 }} />
        <select
          value={data.status}
          onChange={(e) => update({ status: e.target.value as NodeStatus })}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            fontSize: '10px',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'monospace',
            flex: 1,
          }}
        >
          <option value="stable">Stable</option>
          <option value="in-progress">In Progress</option>
          <option value="planned">Planned</option>
          <option value="deprecated">Deprecated</option>
          <option value="broken">Broken</option>
        </select>
        <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#252830' }}>
          {node.id.slice(0, 6)}
        </div>
      </div>

      {/* Body — scrollable sections */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 12px' }}>

        {/* Prompt / Intent */}
        <div style={FIELD_STYLE}>
          <div style={SECTION_LABEL_STYLE}>Intenção / Prompt</div>
          <AutoGrowTextarea
            textareaRef={promptRef as React.RefObject<HTMLTextAreaElement | null>}
            style={{ ...TEXTAREA_STYLE, minHeight: '48px', fontSize: '12px' }}
            value={data.prompt || ''}
            onChange={(v) => update({ prompt: v })}
            placeholder="O que deve acontecer neste nó? Descreva a intenção para um agente..."
          />
        </div>

        {/* Notes */}
        <div style={FIELD_STYLE}>
          <div style={SECTION_LABEL_STYLE}>Notas</div>
          <AutoGrowTextarea
            style={{ ...TEXTAREA_STYLE, minHeight: '40px' }}
            value={data.notes || ''}
            onChange={(v) => update({ notes: v })}
            placeholder="Notas livres, observações, dependências..."
          />
        </div>

        {/* Description */}
        <div style={FIELD_STYLE}>
          <div style={SECTION_LABEL_STYLE}>Descrição</div>
          <AutoGrowTextarea
            style={{ ...TEXTAREA_STYLE, minHeight: '36px' }}
            value={data.description || ''}
            onChange={(v) => update({ description: v })}
            placeholder="O que este nó faz?"
          />
        </div>

        {/* Routes */}
        <div style={FIELD_STYLE}>
          <div style={SECTION_LABEL_STYLE}>Rota</div>
          <input
            style={INPUT_STYLE}
            value={data.routePath || ''}
            onChange={(e) => update({ routePath: e.target.value })}
            placeholder="/path/to/route"
          />
        </div>

        <div style={FIELD_STYLE}>
          <div style={SECTION_LABEL_STYLE}>Arquivo</div>
          <input
            style={INPUT_STYLE}
            value={data.filePath || ''}
            onChange={(e) => update({ filePath: e.target.value })}
            placeholder="app/page.tsx"
          />
        </div>

        {/* Tasks */}
        <div style={FIELD_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={SECTION_LABEL_STYLE}>Tarefas</div>
            {pendingTasks.length > 0 && (
              <span style={{ fontSize: '9px', color: '#3d5a80', fontFamily: 'monospace' }}>
                {pendingTasks.length} pendente{pendingTasks.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <input
              style={{ ...INPUT_STYLE, flex: 1 }}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Adicionar tarefa..."
            />
            <button onClick={addTask} style={ADD_BTN_STYLE}>+</button>
          </div>
          {pendingTasks.length === 0 && doneTasks.length === 0 && (
            <div style={{ color: '#252830', fontSize: '11px', textAlign: 'center', padding: '8px 0' }}>
              Nenhuma tarefa
            </div>
          )}
          {pendingTasks.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} onRemove={() => removeTask(t.id)} />
          ))}
          {doneTasks.length > 0 && (
            <>
              <div style={{ fontSize: '8px', color: '#252830', fontFamily: 'monospace', textTransform: 'uppercase', margin: '8px 0 4px' }}>
                Concluídas
              </div>
              {doneTasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} onRemove={() => removeTask(t.id)} />
              ))}
            </>
          )}
        </div>

        {/* Bugs */}
        <div style={FIELD_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={SECTION_LABEL_STYLE}>Bugs</div>
            {openBugs.length > 0 && (
              <span style={{ fontSize: '9px', color: '#7a3535', fontFamily: 'monospace' }}>
                {openBugs.length} aberto{openBugs.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <input
              style={{ ...INPUT_STYLE, flex: 1 }}
              value={newBug}
              onChange={(e) => setNewBug(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBug()}
              placeholder="Descrever bug..."
            />
            <select
              value={newBugSeverity}
              onChange={(e) => setNewBugSeverity(e.target.value as Bug['severity'])}
              style={{
                background: '#141618',
                border: '1px solid #252830',
                borderRadius: '4px',
                padding: '4px',
                color: '#6b7280',
                fontSize: '10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="low">low</option>
              <option value="medium">med</option>
              <option value="high">high</option>
            </select>
            <button onClick={addBug} style={{ ...ADD_BTN_STYLE, color: '#7a3535' }}>+</button>
          </div>
          {openBugs.length === 0 && resolvedBugs.length === 0 && (
            <div style={{ color: '#252830', fontSize: '11px', textAlign: 'center', padding: '8px 0' }}>
              Nenhum bug
            </div>
          )}
          {openBugs.map((b) => (
            <BugRow key={b.id} bug={b} onToggle={() => toggleBug(b.id)} onRemove={() => removeBug(b.id)} />
          ))}
          {resolvedBugs.length > 0 && (
            <>
              <div style={{ fontSize: '8px', color: '#252830', fontFamily: 'monospace', textTransform: 'uppercase', margin: '8px 0 4px' }}>
                Resolvidos
              </div>
              {resolvedBugs.map((b) => (
                <BugRow key={b.id} bug={b} onToggle={() => toggleBug(b.id)} onRemove={() => removeBug(b.id)} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #1e2128',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={() => removeNode(node.id)}
          style={{
            background: 'transparent',
            border: '1px solid #2a1a1a',
            borderRadius: '4px',
            padding: '4px 10px',
            color: '#7a3535',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" width="10" height="10">
            <path d="M3 4H13L11.5 13H4.5L3 4Z" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M6 4V2H10V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M1 4H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Remover nó
        </button>
      </div>
    </div>
  );
}

const ADD_BTN_STYLE: React.CSSProperties = {
  background: '#141618',
  border: '1px solid #252830',
  borderRadius: '4px',
  padding: '4px 8px',
  color: '#4b5563',
  fontSize: '13px',
  cursor: 'pointer',
  flexShrink: 0,
};

function TaskRow({ task, onToggle, onRemove }: { task: Task; onToggle: () => void; onRemove: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        padding: '5px 6px',
        borderRadius: '3px',
        background: '#141618',
        marginBottom: '3px',
        border: '1px solid #1e2128',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '13px',
          height: '13px',
          borderRadius: '2px',
          border: `1px solid ${task.done ? '#22c55e' : '#2e3340'}`,
          background: task.done ? '#22c55e18' : 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22c55e',
          fontSize: '8px',
          padding: 0,
        }}
      >
        {task.done && '✓'}
      </button>
      <span
        style={{
          fontSize: '11px',
          color: task.done ? '#2e3340' : '#8b95a5',
          textDecoration: task.done ? 'line-through' : 'none',
          flex: 1,
          lineHeight: '1.4',
        }}
      >
        {task.text}
      </span>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', color: '#252830', cursor: 'pointer', padding: 0, flexShrink: 0, fontSize: '13px', lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}

const SEVERITY_COLORS: Record<string, string> = { low: '#3d5a80', medium: '#8b6914', high: '#7a3535' };

function BugRow({ bug, onToggle, onRemove }: { bug: Bug; onToggle: () => void; onRemove: () => void }) {
  const color = SEVERITY_COLORS[bug.severity] || '#3d5a80';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        padding: '5px 6px',
        borderRadius: '3px',
        background: '#141618',
        marginBottom: '3px',
        border: `1px solid ${bug.resolved ? '#1e2128' : color + '44'}`,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '13px',
          height: '13px',
          borderRadius: '2px',
          border: `1px solid ${bug.resolved ? '#22c55e' : color}`,
          background: bug.resolved ? '#22c55e18' : 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22c55e',
          fontSize: '8px',
          padding: 0,
        }}
      >
        {bug.resolved && '✓'}
      </button>
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontSize: '11px',
            color: bug.resolved ? '#2e3340' : '#8b95a5',
            textDecoration: bug.resolved ? 'line-through' : 'none',
            lineHeight: '1.4',
          }}
        >
          {bug.text}
        </span>
        <div>
          <span
            style={{
              fontSize: '8px',
              color,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginTop: '2px',
              display: 'inline-block',
            }}
          >
            {bug.severity}
          </span>
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', color: '#252830', cursor: 'pointer', padding: 0, flexShrink: 0, fontSize: '13px', lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}
