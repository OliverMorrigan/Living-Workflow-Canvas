import React, { useState, useRef, useEffect } from 'react';
import type { CanvasNodeData, NodeStatus, Task, Bug } from '../types';
import { useCanvasStore } from '../store/useCanvasStore';
import { NODE_TYPE_CONFIGS, STATUS_CONFIGS } from './nodes/nodeConfig';
import { v4 as uuidv4 } from 'uuid';

type Tab = 'context' | 'tasks' | 'bugs' | 'prompt';

export default function InspectorPanel() {
  const { nodes, selectedNodeId, updateNodeData, removeNode, setInspectorOpen, isInspectorOpen } = useCanvasStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [activeTab, setActiveTab] = useState<Tab>('context');
  const [newTask, setNewTask] = useState('');
  const [newBug, setNewBug] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<Bug['severity']>('medium');

  if (!isInspectorOpen || !node) return null;

  const data = node.data;
  const typeConfig = NODE_TYPE_CONFIGS[data.type];
  const statusConfig = STATUS_CONFIGS[data.status];

  const update = (patch: Partial<CanvasNodeData>) => {
    updateNodeData(node.id, patch);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    update({
      tasks: [...(data.tasks || []), { id: uuidv4(), text: newTask.trim(), done: false }],
    });
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    update({
      tasks: data.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t),
    });
  };

  const removeTask = (taskId: string) => {
    update({ tasks: data.tasks.filter((t) => t.id !== taskId) });
  };

  const addBug = () => {
    if (!newBug.trim()) return;
    update({
      bugs: [
        ...(data.bugs || []),
        { id: uuidv4(), text: newBug.trim(), severity: newBugSeverity, resolved: false },
      ],
    });
    setNewBug('');
  };

  const toggleBug = (bugId: string) => {
    update({
      bugs: data.bugs.map((b) => b.id === bugId ? { ...b, resolved: !b.resolved } : b),
    });
  };

  const removeBug = (bugId: string) => {
    update({ bugs: data.bugs.filter((b) => b.id !== bugId) });
  };

  const openBugs = data.bugs?.filter((b) => !b.resolved) || [];
  const pendingTasks = data.tasks?.filter((t) => !t.done) || [];

  return (
    <div
      className="panel-animate"
      style={{
        width: '320px',
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
      {/* Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid hsl(220 14% 14%)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: typeConfig.bgColor,
            border: `1px solid ${typeConfig.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: typeConfig.color,
            flexShrink: 0,
            fontSize: '14px',
          }}
        >
          {NODE_TYPE_CONFIGS[data.type]?.label?.slice(0, 1)}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <input
            value={data.label}
            onChange={(e) => update({ label: e.target.value })}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: 600,
              width: '100%',
              padding: 0,
            }}
          />
          <div style={{ fontSize: '10px', color: typeConfig.color, marginTop: '1px', fontFamily: 'monospace' }}>
            {typeConfig.label}
          </div>
        </div>
        <button
          onClick={() => setInspectorOpen(false)}
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
        >
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Quick stats */}
      <div
        style={{
          padding: '8px 14px',
          borderBottom: '1px solid hsl(220 14% 14%)',
          display: 'flex',
          gap: '8px',
        }}
      >
        <select
          value={data.status}
          onChange={(e) => update({ status: e.target.value as NodeStatus })}
          style={{
            background: `${statusConfig.color}22`,
            border: `1px solid ${statusConfig.color}44`,
            color: statusConfig.color,
            borderRadius: '5px',
            padding: '3px 6px',
            fontSize: '10px',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'monospace',
            fontWeight: 600,
            flex: 1,
          }}
        >
          <option value="stable">Stable</option>
          <option value="in-progress">In Progress</option>
          <option value="planned">Planned</option>
          <option value="deprecated">Deprecated</option>
          <option value="broken">Broken</option>
        </select>
        <div style={{ display: 'flex', gap: '6px', fontSize: '10px', alignItems: 'center' }}>
          {openBugs.length > 0 && (
            <span style={{ color: '#f87171', background: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
              {openBugs.length} bug{openBugs.length > 1 ? 's' : ''}
            </span>
          )}
          {pendingTasks.length > 0 && (
            <span style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
              {pendingTasks.length} task{pendingTasks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          padding: '0 14px',
          gap: '2px',
          borderBottom: '1px solid hsl(220 14% 14%)',
        }}
      >
        {(['context', 'tasks', 'bugs', 'prompt'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 10px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`,
              color: activeTab === tab ? '#60a5fa' : '#475569',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {tab}
            {tab === 'tasks' && pendingTasks.length > 0 && (
              <span style={{ marginLeft: '4px', background: '#3b82f644', color: '#60a5fa', borderRadius: '3px', padding: '0 4px', fontSize: '9px' }}>
                {pendingTasks.length}
              </span>
            )}
            {tab === 'bugs' && openBugs.length > 0 && (
              <span style={{ marginLeft: '4px', background: '#ef444444', color: '#f87171', borderRadius: '3px', padding: '0 4px', fontSize: '9px' }}>
                {openBugs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
        {activeTab === 'context' && (
          <ContextTab data={data} update={update} />
        )}
        {activeTab === 'tasks' && (
          <TasksTab
            data={data}
            newTask={newTask}
            setNewTask={setNewTask}
            addTask={addTask}
            toggleTask={toggleTask}
            removeTask={removeTask}
          />
        )}
        {activeTab === 'bugs' && (
          <BugsTab
            data={data}
            newBug={newBug}
            setNewBug={setNewBug}
            newBugSeverity={newBugSeverity}
            setNewBugSeverity={setNewBugSeverity}
            addBug={addBug}
            toggleBug={toggleBug}
            removeBug={removeBug}
          />
        )}
        {activeTab === 'prompt' && (
          <PromptTab data={data} update={update} nodeId={node.id} />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid hsl(220 14% 14%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '9px', fontFamily: 'monospace', color: '#334155' }}>
          id: {node.id.slice(0, 8)}
        </div>
        <button
          onClick={() => removeNode(node.id)}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '5px',
            padding: '4px 8px',
            color: '#f87171',
            fontSize: '10px',
            cursor: 'pointer',
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
          Delete
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
      {children}
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: '12px' }}>{children}</div>;
}

const inputStyle = {
  width: '100%',
  background: 'hsl(222 18% 12%)',
  border: '1px solid hsl(220 14% 18%)',
  borderRadius: '6px',
  padding: '6px 10px',
  color: '#e2e8f0',
  fontSize: '12px',
  outline: 'none',
  fontFamily: 'monospace',
  resize: 'none' as const,
  lineHeight: '1.5',
};

function ContextTab({ data, update }: { data: CanvasNodeData; update: (p: Partial<CanvasNodeData>) => void }) {
  return (
    <>
      <Field>
        <Label>Route Path</Label>
        <input
          style={inputStyle}
          value={data.routePath || ''}
          onChange={(e) => update({ routePath: e.target.value })}
          placeholder="/path/to/route"
        />
      </Field>
      <Field>
        <Label>File Path</Label>
        <input
          style={inputStyle}
          value={data.filePath || ''}
          onChange={(e) => update({ filePath: e.target.value })}
          placeholder="app/page.tsx"
        />
      </Field>
      <Field>
        <Label>Description</Label>
        <textarea
          style={{ ...inputStyle, minHeight: '72px' }}
          value={data.description || ''}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="What does this node do?"
        />
      </Field>
      <Field>
        <Label>Notes</Label>
        <textarea
          style={{ ...inputStyle, minHeight: '60px' }}
          value={data.notes || ''}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Implementation notes, dependencies..."
        />
      </Field>
    </>
  );
}

function TasksTab({
  data, newTask, setNewTask, addTask, toggleTask, removeTask,
}: {
  data: CanvasNodeData;
  newTask: string;
  setNewTask: (v: string) => void;
  addTask: () => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}) {
  const done = data.tasks?.filter((t) => t.done) || [];
  const pending = data.tasks?.filter((t) => !t.done) || [];

  return (
    <>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add task..."
        />
        <button
          onClick={addTask}
          style={{
            background: '#3b82f622',
            border: '1px solid #3b82f644',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#60a5fa',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
      {pending.length === 0 && done.length === 0 && (
        <div style={{ color: '#334155', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>
          No tasks yet
        </div>
      )}
      {pending.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} onRemove={() => removeTask(task.id)} />
      ))}
      {done.length > 0 && (
        <>
          <div style={{ fontSize: '9px', color: '#334155', fontFamily: 'monospace', textTransform: 'uppercase', marginTop: '10px', marginBottom: '6px' }}>
            Completed
          </div>
          {done.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} onRemove={() => removeTask(task.id)} />
          ))}
        </>
      )}
    </>
  );
}

function TaskItem({ task, onToggle, onRemove }: { task: Task; onToggle: () => void; onRemove: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: '6px',
        background: 'hsl(222 18% 12%)',
        marginBottom: '4px',
        border: '1px solid hsl(220 14% 16%)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '3px',
          border: `1px solid ${task.done ? '#22c55e' : '#334155'}`,
          background: task.done ? '#22c55e22' : 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22c55e',
          fontSize: '9px',
        }}
      >
        {task.done && '✓'}
      </button>
      <span
        style={{
          fontSize: '12px',
          color: task.done ? '#334155' : '#94a3b8',
          textDecoration: task.done ? 'line-through' : 'none',
          flex: 1,
          lineHeight: '1.4',
        }}
      >
        {task.text}
      </span>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '1px', flexShrink: 0, fontSize: '12px' }}
      >
        ×
      </button>
    </div>
  );
}

function BugsTab({
  data, newBug, setNewBug, newBugSeverity, setNewBugSeverity, addBug, toggleBug, removeBug,
}: {
  data: CanvasNodeData;
  newBug: string;
  setNewBug: (v: string) => void;
  newBugSeverity: Bug['severity'];
  setNewBugSeverity: (v: Bug['severity']) => void;
  addBug: () => void;
  toggleBug: (id: string) => void;
  removeBug: (id: string) => void;
}) {
  const open = data.bugs?.filter((b) => !b.resolved) || [];
  const resolved = data.bugs?.filter((b) => b.resolved) || [];

  return (
    <>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={newBug}
          onChange={(e) => setNewBug(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addBug()}
          placeholder="Describe bug..."
        />
        <select
          value={newBugSeverity}
          onChange={(e) => setNewBugSeverity(e.target.value as Bug['severity'])}
          style={{
            background: 'hsl(222 18% 12%)',
            border: '1px solid hsl(220 14% 18%)',
            borderRadius: '6px',
            padding: '6px 4px',
            color: '#94a3b8',
            fontSize: '10px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="low">low</option>
          <option value="medium">med</option>
          <option value="high">high</option>
        </select>
        <button
          onClick={addBug}
          style={{
            background: '#ef444422',
            border: '1px solid #ef444444',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#f87171',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
      {open.length === 0 && resolved.length === 0 && (
        <div style={{ color: '#334155', fontSize: '12px', textAlign: 'center', padding: '24px 0' }}>
          No bugs logged
        </div>
      )}
      {open.map((bug) => (
        <BugItem key={bug.id} bug={bug} onToggle={() => toggleBug(bug.id)} onRemove={() => removeBug(bug.id)} />
      ))}
      {resolved.length > 0 && (
        <>
          <div style={{ fontSize: '9px', color: '#334155', fontFamily: 'monospace', textTransform: 'uppercase', marginTop: '10px', marginBottom: '6px' }}>
            Resolved
          </div>
          {resolved.map((bug) => (
            <BugItem key={bug.id} bug={bug} onToggle={() => toggleBug(bug.id)} onRemove={() => removeBug(bug.id)} />
          ))}
        </>
      )}
    </>
  );
}

const SEVERITY_COLORS = { low: '#60a5fa', medium: '#f59e0b', high: '#f87171' };

function BugItem({ bug, onToggle, onRemove }: { bug: Bug; onToggle: () => void; onRemove: () => void }) {
  const color = SEVERITY_COLORS[bug.severity];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: '6px',
        background: bug.resolved ? 'hsl(222 18% 12%)' : `${color}0d`,
        marginBottom: '4px',
        border: `1px solid ${bug.resolved ? 'hsl(220 14% 16%)' : `${color}33`}`,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '3px',
          border: `1px solid ${bug.resolved ? '#22c55e' : color}`,
          background: bug.resolved ? '#22c55e22' : 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22c55e',
          fontSize: '9px',
        }}
      >
        {bug.resolved && '✓'}
      </button>
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontSize: '12px',
            color: bug.resolved ? '#334155' : '#94a3b8',
            textDecoration: bug.resolved ? 'line-through' : 'none',
            lineHeight: '1.4',
          }}
        >
          {bug.text}
        </span>
        <div>
          <span
            style={{
              fontSize: '9px',
              background: `${color}22`,
              color: color,
              borderRadius: '3px',
              padding: '1px 4px',
              marginTop: '3px',
              display: 'inline-block',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            {bug.severity}
          </span>
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '1px', flexShrink: 0, fontSize: '12px' }}
      >
        ×
      </button>
    </div>
  );
}

function PromptTab({ data, update, nodeId }: { data: CanvasNodeData; update: (p: Partial<CanvasNodeData>) => void; nodeId: string }) {
  const { nodes, edges, setGeneratedPlan, setPlanPanelOpen, setGeneratingPlan } = useCanvasStore();
  const [localOutput, setLocalOutput] = useState('');

  const generateNodeContext = async () => {
    setGeneratingPlan(true);
    const connectedEdges = edges.filter((e) => e.source === nodeId || e.target === nodeId);
    const connectedNodeIds = new Set(
      connectedEdges.flatMap((e) => [e.source, e.target]).filter((id) => id !== nodeId)
    );
    const connectedNodes = nodes.filter((n) => connectedNodeIds.has(n.id));

    await new Promise((r) => setTimeout(r, 800));

    const plan = generateContextualPlan(data, connectedEdges, connectedNodes);
    setLocalOutput(plan);
    setGeneratedPlan(plan);
    setGeneratingPlan(false);
    setPlanPanelOpen(true);
  };

  return (
    <>
      <div style={{ marginBottom: '12px' }}>
        <Label>Context Prompt</Label>
        <textarea
          style={{ ...inputStyle, minHeight: '80px' }}
          value={data.prompt || ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder="Ask about this node, e.g.: 'What are the dependencies?' or 'Generate a refactor plan'"
        />
      </div>
      <button
        onClick={generateNodeContext}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
          border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: '8px',
          padding: '8px',
          color: '#c4b5fd',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
          <path d="M8 2L3 6H6V14H10V6H13L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
        Generate Node Context
      </button>
      {localOutput && (
        <div
          style={{
            background: 'hsl(222 18% 12%)',
            border: '1px solid hsl(220 14% 18%)',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '11px',
            color: '#94a3b8',
            fontFamily: 'monospace',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            maxHeight: '300px',
            overflow: 'auto',
          }}
        >
          {localOutput}
        </div>
      )}
    </>
  );
}

function generateContextualPlan(
  data: CanvasNodeData,
  connectedEdges: ReturnType<typeof useCanvasStore.getState>['edges'],
  connectedNodes: ReturnType<typeof useCanvasStore.getState>['nodes']
): string {
  const lines: string[] = [];
  const statusLabels = { stable: 'Stable', 'in-progress': 'In Progress', planned: 'Planned', deprecated: 'Deprecated', broken: 'Broken' };

  lines.push(`# Node Context: ${data.label}`);
  lines.push('');
  lines.push(`**Type:** ${data.type}`);
  lines.push(`**Status:** ${statusLabels[data.status]}`);
  if (data.routePath) lines.push(`**Route:** \`${data.routePath}\``);
  if (data.filePath) lines.push(`**File:** \`${data.filePath}\``);
  lines.push('');

  if (data.description) {
    lines.push('## Description');
    lines.push(data.description);
    lines.push('');
  }

  if (data.notes) {
    lines.push('## Notes');
    lines.push(data.notes);
    lines.push('');
  }

  if (connectedNodes.length > 0) {
    lines.push('## Connections');
    connectedEdges.forEach((edge) => {
      const isSource = edge.source === data.id;
      const otherNodeId = isSource ? edge.target : edge.source;
      const otherNode = connectedNodes.find((n) => n.id === otherNodeId);
      const rel = (edge.data as { label?: string })?.label || 'connects to';
      if (otherNode) {
        lines.push(`- ${isSource ? '→' : '←'} **${otherNode.data.label}** (${rel})`);
      }
    });
    lines.push('');
  }

  const openBugs = data.bugs?.filter((b) => !b.resolved) || [];
  const pendingTasks = data.tasks?.filter((t) => !t.done) || [];

  if (openBugs.length > 0) {
    lines.push('## Open Bugs');
    openBugs.forEach((b) => lines.push(`- [${b.severity.toUpperCase()}] ${b.text}`));
    lines.push('');
  }

  if (pendingTasks.length > 0) {
    lines.push('## Pending Tasks');
    pendingTasks.forEach((t) => lines.push(`- [ ] ${t.text}`));
    lines.push('');
  }

  if (data.prompt) {
    lines.push('## Agent Prompt');
    lines.push(data.prompt);
    lines.push('');
  }

  lines.push('## Agent Notes');
  if (data.status === 'broken') {
    lines.push('⚠️ This node is marked as BROKEN. Prioritize resolution before proceeding with connected changes.');
  } else if (data.status === 'in-progress') {
    lines.push('🔧 Active development in progress. Coordinate with open tasks before making structural changes.');
  } else if (data.status === 'planned') {
    lines.push('📋 This node is planned but not yet implemented. Design phase — validate connections before building.');
  } else {
    lines.push('✅ This node appears stable. Safe to reference in change plans.');
  }

  return lines.join('\n');
}
