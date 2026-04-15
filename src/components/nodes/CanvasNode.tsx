import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CanvasNodeData } from '../../types';
import { NODE_TYPE_CONFIGS, STATUS_CONFIGS } from './nodeConfig';
import { useCanvasStore } from '../../store/useCanvasStore';

const NODE_TYPE_ICONS: Record<string, React.ReactNode> = {
  page: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="8.5" x2="11" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  route: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path d="M2 8H14M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  component: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="3" y="3" width="4" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="3" width="4" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="9" width="4" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="4" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path d="M3 5L8 2L13 5V11L8 14L3 11V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  auth: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="4" y="7" width="8" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 7V5.5C5.5 3.57 6.79 2 8 2C9.21 2 10.5 3.57 10.5 5.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  middleware: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 3V8L11 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  database: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <ellipse cx="8" cy="4.5" rx="5.5" ry="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2.5 4.5V11.5C2.5 12.88 4.96 14 8 14C11.04 14 13.5 12.88 13.5 11.5V4.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2.5 8C2.5 9.38 4.96 10.5 8 10.5C11.04 10.5 13.5 9.38 13.5 8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  gateway: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  'ui-action': (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="2" y="5" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 8H10M8 6.5V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

const HANDLE_STYLE: React.CSSProperties = {
  background: '#ffffff',
  width: 10,
  height: 10,
  border: '2px solid #1e2128',
  boxShadow: '0 0 8px rgba(0,0,0,0.5)',
  opacity: 0,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
};

function CanvasNode({ data, selected, id }: NodeProps<CanvasNodeData>) {
  const typeConfig = NODE_TYPE_CONFIGS[data.type] || NODE_TYPE_CONFIGS.page;
  const statusConfig = STATUS_CONFIGS[data.status] || STATUS_CONFIGS.stable;
  const { updateNodeData } = useCanvasStore();

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [hovered, setHovered] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const pendingTasks = data.tasks?.filter((t) => !t.done) || [];
  const openBugs = data.bugs?.filter((b) => !b.resolved) || [];
  const hasPrompt = !!data.prompt;

  useEffect(() => {
    if (isEditingLabel) {
      setEditValue(data.label);
      setTimeout(() => {
        labelInputRef.current?.focus();
        labelInputRef.current?.select();
      }, 10);
    }
  }, [isEditingLabel, data.label]);

  const commitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== data.label) {
      updateNodeData(id, { label: trimmed });
    }
    setIsEditingLabel(false);
  }, [editValue, data.label, id, updateNodeData]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditingLabel(true);
  }, []);

  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { setIsEditingLabel(false); }
  }, [commitEdit]);

  const showHandles = hovered || selected;
  const handleStyleActive: React.CSSProperties = { 
    ...HANDLE_STYLE, 
    opacity: showHandles ? 1 : 0, 
    borderColor: typeConfig.accentColor,
    transform: showHandles ? 'scale(1)' : 'scale(0.8)'
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={handleDoubleClick}
      className={`relative rounded-xl overflow-hidden backdrop-blur-xl transition-all duration-300 ease-out 
        ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0b0c10] shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-50' : 'shadow-lg hover:shadow-xl'}`
      }
      style={{
        background: 'rgba(21, 23, 28, 0.85)',
        border: `1px solid ${selected ? typeConfig.accentColor : 'rgba(255,255,255,0.06)'}`,
        width: '240px',
        cursor: isEditingLabel ? 'text' : 'pointer',
        boxShadow: selected ? `0 0 30px ${typeConfig.accentColor}33` : undefined,
        transform: hovered && !selected ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Top glowing accent bar */}
      <div 
        className="absolute top-0 left-0 w-full h-[3px]" 
        style={{ 
          background: `linear-gradient(90deg, transparent 0%, ${typeConfig.accentColor} 50%, transparent 100%)`,
          opacity: selected || hovered ? 1 : 0.7,
        }} 
      />

      {/* Main Content Area */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded-md flex items-center justify-center shadow-inner"
              style={{ background: 'rgba(0,0,0,0.3)', color: typeConfig.accentColor, border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {NODE_TYPE_ICONS[data.type]}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase opacity-70" style={{ color: typeConfig.accentColor }}>
                {typeConfig.label}
              </div>
              {isEditingLabel ? (
                <input
                  ref={labelInputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={handleLabelKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="nodrag text-[14px] font-bold text-white w-full bg-transparent outline-none border-b border-blue-500 pb-0.5 mt-0.5"
                />
              ) : (
                <div className="text-[14px] font-bold text-gray-100 truncate mt-0.5" title={data.label}>
                  {data.label}
                </div>
              )}
            </div>
          </div>
          
          <div 
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-inner"
            title={data.status}
            style={{ 
              background: statusConfig.color, 
              boxShadow: `0 0 10px ${statusConfig.color}88, inset 0 2px 4px rgba(255,255,255,0.3)` 
            }}
          />
        </div>

        {/* Route / Path Display */}
        {(data.routePath || data.filePath) && (
          <div className="text-[11px] font-mono text-gray-400 bg-black/40 px-2 py-1.5 rounded border border-white/5 truncate mb-3">
            {data.routePath || data.filePath}
          </div>
        )}

        {/* Badges / Meta Info */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {pendingTasks.length > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-semibold px-2 py-1 rounded border border-amber-500/20">
              <svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M2.5 8L6 11.5L13.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {pendingTasks.length} Task{pendingTasks.length > 1 ? 's' : ''}
            </div>
          )}
          
          {openBugs.length > 0 && (
            <div className="flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] font-semibold px-2 py-1 rounded border border-red-500/20">
              <svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10"><path fillRule="evenodd" d="M8 2a3 3 0 00-3 3v1H4a1 1 0 000 2h1v1H4a1 1 0 100 2h1v1a3 3 0 003 3h0a3 3 0 003-3v-1h1a1 1 0 100-2h-1v-1h1a1 1 0 100-2h-1V5a3 3 0 00-3-3z" clipRule="evenodd"/></svg>
              {openBugs.length} Bug{openBugs.length > 1 ? 's' : ''}
            </div>
          )}

          {hasPrompt && (
            <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 text-[10px] font-semibold px-2 py-1 rounded border border-blue-500/20 ml-auto">
              <svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M2 13.5L4.5 11M14 2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="6" y="2" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="2"/></svg>
              Agent
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Top} style={handleStyleActive} />
      <Handle type="source" position={Position.Bottom} style={handleStyleActive} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyleActive} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyleActive} />
    </div>
  );
}

export default memo(CanvasNode);
