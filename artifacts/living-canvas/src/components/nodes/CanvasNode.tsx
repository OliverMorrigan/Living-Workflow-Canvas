import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CanvasNodeData } from '../../types';
import { NODE_TYPE_CONFIGS, STATUS_CONFIGS } from './nodeConfig';

const NODE_TYPE_ICONS: Record<string, React.ReactNode> = {
  page: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="8.5" x2="11" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  route: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <path d="M2 8H14M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  component: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <rect x="3" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="3" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <path d="M3 5L8 2L13 5V11L8 14L3 11V5Z" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  auth: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 7V5.5C5.5 3.57 6.79 2 8 2C9.21 2 10.5 3.57 10.5 5.5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  middleware: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 3V8L11 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  database: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <ellipse cx="8" cy="4.5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3 4.5V11.5C3 12.6 5.24 13.5 8 13.5C10.76 13.5 13 12.6 13 11.5V4.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3 8C3 9.1 5.24 10 8 10C10.76 10 13 9.1 13 8" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  gateway: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 2V14M2 5.5L14 5.5M2 10.5L14 10.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
    </svg>
  ),
  'ui-action': (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <rect x="2" y="5" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 8H10M8 6.5V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

function CanvasNode({ data, selected }: NodeProps<CanvasNodeData>) {
  const typeConfig = NODE_TYPE_CONFIGS[data.type] || NODE_TYPE_CONFIGS.page;
  const statusConfig = STATUS_CONFIGS[data.status] || STATUS_CONFIGS.stable;

  const bugCount = data.bugs?.filter((b) => !b.resolved).length || 0;
  const taskCount = data.tasks?.filter((t) => !t.done).length || 0;

  return (
    <div
      className="canvas-node-enter"
      style={{
        background: typeConfig.bgColor,
        border: `1px solid ${selected ? '#3b82f6' : typeConfig.borderColor}`,
        borderRadius: '10px',
        minWidth: '170px',
        maxWidth: '210px',
        padding: '10px 12px',
        cursor: 'pointer',
        boxShadow: selected
          ? '0 0 0 2px rgba(59,130,246,0.5), 0 4px 24px rgba(0,0,0,0.5)'
          : '0 2px 12px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: typeConfig.color,
          width: 8,
          height: 8,
          border: '2px solid rgba(0,0,0,0.6)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
        <div
          style={{
            color: typeConfig.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: '6px',
            background: `${typeConfig.color}22`,
            flexShrink: 0,
          }}
        >
          {NODE_TYPE_ICONS[data.type]}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#e2e8f0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.3',
            }}
          >
            {data.label}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: typeConfig.color,
              fontFamily: 'monospace',
              marginTop: '1px',
              opacity: 0.8,
            }}
          >
            {NODE_TYPE_CONFIGS[data.type]?.label}
          </div>
        </div>
      </div>

      {data.routePath && (
        <div
          style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#64748b',
            background: 'rgba(0,0,0,0.3)',
            padding: '2px 6px',
            borderRadius: '4px',
            marginBottom: '6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.routePath}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusConfig.color,
              boxShadow: `0 0 4px ${statusConfig.color}`,
            }}
          />
          <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {statusConfig.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {bugCount > 0 && (
            <span
              style={{
                fontSize: '9px',
                background: 'rgba(239,68,68,0.2)',
                color: '#f87171',
                borderRadius: '3px',
                padding: '1px 4px',
                fontWeight: 600,
              }}
            >
              {bugCount} bug{bugCount > 1 ? 's' : ''}
            </span>
          )}
          {taskCount > 0 && (
            <span
              style={{
                fontSize: '9px',
                background: 'rgba(59,130,246,0.2)',
                color: '#60a5fa',
                borderRadius: '3px',
                padding: '1px 4px',
                fontWeight: 600,
              }}
            >
              {taskCount} task{taskCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: typeConfig.color,
          width: 8,
          height: 8,
          border: '2px solid rgba(0,0,0,0.6)',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: typeConfig.color,
          width: 8,
          height: 8,
          border: '2px solid rgba(0,0,0,0.6)',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: typeConfig.color,
          width: 8,
          height: 8,
          border: '2px solid rgba(0,0,0,0.6)',
        }}
      />
    </div>
  );
}

export default memo(CanvasNode);
