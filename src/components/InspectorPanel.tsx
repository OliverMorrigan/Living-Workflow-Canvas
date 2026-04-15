import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CanvasNodeData, NodeStatus, Task, Bug } from '../types';
import { useCanvasStore } from '../store/useCanvasStore';
import { NODE_TYPE_CONFIGS, STATUS_CONFIGS } from './nodes/nodeConfig';
import { v4 as uuidv4 } from 'uuid';
import { useChat } from 'ai/react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  MessageSquare, 
  Info, 
  CheckCircle2, 
  Bug as BugIcon, 
  Send, 
  Trash2, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function InspectorPanel() {
  const { nodes, selectedNodeId, updateNodeData, removeNode, setInspectorOpen, isInspectorOpen } =
    useCanvasStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK integration
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      context: node?.data,
    },
  });

  const [newTask, setNewTask] = useState('');
  const [newBug, setNewBug] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<Bug['severity']>('medium');

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const addBug = () => {
    if (!newBug.trim()) return;
    update({
      bugs: [...(data.bugs || []), { id: uuidv4(), text: newBug.trim(), severity: newBugSeverity, resolved: false }],
    });
    setNewBug('');
  };

  return (
    <div className="w-[360px] h-full bg-[#13151a] border-l border-[#1e2128] flex flex-col shrink-0 overflow-hidden z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      {/* Premium Header */}
      <div className="p-4 border-b border-[#1e2128] flex items-center gap-3">
        <div 
          className="w-1 h-8 rounded-full" 
          style={{ background: typeConfig.accentColor }} 
        />
        <div className="flex-1 overflow-hidden">
          <input
            value={data.label}
            onChange={(e) => update({ label: e.target.value })}
            className="bg-transparent border-none outline-none text-white text-[14px] font-bold w-full p-0 focus:ring-0"
          />
          <div className="text-[10px] uppercase tracking-widest font-mono opacity-50" style={{ color: typeConfig.accentColor }}>
            {typeConfig.label}
          </div>
        </div>
        <button onClick={() => setInspectorOpen(false)} className="p-1.5 hover:bg-white/5 rounded-md text-gray-500 transition-colors">
          <X size={16} />
        </button>
      </div>

      <Tabs.Root defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
        <Tabs.List className="flex border-b border-[#1e2128] px-2 bg-black/20">
          <Tabs.Trigger value="info" className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 flex items-center justify-center gap-2 outline-none transition-all">
            <Info size={14} /> Details
          </Tabs.Trigger>
          <Tabs.Trigger value="chat" className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 data-[state=active]:text-emerald-500 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 flex items-center justify-center gap-2 outline-none transition-all">
            <MessageSquare size={14} /> AI Chat
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="info" className="flex-1 overflow-auto p-4 space-y-6">
          {/* Status Select */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-mono text-gray-600 block">Current Status</label>
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusConfig.color, boxShadow: `0 0 10px ${statusConfig.color}44` }} />
              <select
                value={data.status}
                onChange={(e) => update({ status: e.target.value as NodeStatus })}
                className="bg-transparent border-none text-gray-300 text-[12px] font-medium outline-none cursor-pointer flex-1"
              >
                <option value="stable">Stable</option>
                <option value="in-progress">In Progress</option>
                <option value="planned">Planned</option>
                <option value="deprecated">Deprecated</option>
                <option value="broken">Broken</option>
              </select>
            </div>
          </div>

          {/* Paths */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-mono text-gray-600">Route Path</label>
              <input 
                value={data.routePath || ''} 
                onChange={(e) => update({ routePath: e.target.value })}
                placeholder="/..." 
                className="w-full bg-black/20 border border-white/5 rounded-md p-2 text-[11px] text-gray-400 font-mono focus:border-blue-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-mono text-gray-600">File Path</label>
              <input 
                value={data.filePath || ''} 
                onChange={(e) => update({ filePath: e.target.value })}
                placeholder="src/..." 
                className="w-full bg-black/20 border border-white/5 rounded-md p-2 text-[11px] text-gray-400 font-mono focus:border-blue-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase font-mono text-gray-600">Notes & Context</label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Internal implementation details..."
              className="w-full bg-black/20 border border-white/5 rounded-md p-3 text-[12px] text-gray-300 min-height-[100px] focus:border-blue-500/50 outline-none transition-all resize-none"
            />
          </div>

          {/* Tasks & Bugs Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-amber-500">
                <CheckCircle2 size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Tasks</span>
              </div>
              <span className="text-[10px] font-mono text-gray-600">{data.tasks?.length || 0} Total</span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input 
                  value={newTask} 
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="New task..." 
                  className="flex-1 bg-black/40 border border-white/5 rounded p-2 text-[11px] text-gray-300 outline-none"
                />
                <button onClick={addTask} className="bg-blue-600 hover:bg-blue-500 p-2 rounded text-white transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="space-y-1.5 pt-2">
                {data.tasks?.map((task) => (
                  <div key={task.id} className="group flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={task.done} 
                        onChange={() => update({ tasks: data.tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t) })}
                        className="w-3.5 h-3.5 rounded border-gray-700 bg-gray-800 text-blue-600"
                      />
                      <span className={`text-[11px] ${task.done ? 'line-through text-gray-600' : 'text-gray-400'}`}>{task.text}</span>
                    </div>
                    <button 
                      onClick={() => update({ tasks: data.tasks.filter(t => t.id !== task.id) })}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="chat" className="flex-1 flex flex-col overflow-hidden relative">
          {/* AI Backglow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none" />
          
          <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                <Sparkles size={32} className="mb-4 text-emerald-500" />
                <p className="text-[12px] font-medium text-gray-400">
                  Pergunte ao Agente sobre a implementação deste nó. Ele tem acesso a todo o contexto acima.
                </p>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-[#1a1d23] text-gray-300 border border-white/5 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">
                      {m.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-[#1a1d23] p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1 items-center">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
               </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-[#1e2128] bg-black/20">
            <div className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="Como implementar isso?..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-12 text-[12px] text-white outline-none focus:border-emerald-500/50 transition-all resize-none min-h-[44px] max-h-[120px]"
                rows={1}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-lg transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </Tabs.Content>
      </Tabs.Root>

      {/* Footer Actions */}
      <div className="p-4 bg-black/20 border-t border-[#1e2128] flex justify-between items-center">
        <button 
          onClick={() => removeNode(node.id)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase text-red-500/70 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} /> Delete Node
        </button>
        <span className="text-[10px] font-mono text-gray-700">ID: {node.id.slice(0, 8)}</span>
      </div>
    </div>
  );
}
