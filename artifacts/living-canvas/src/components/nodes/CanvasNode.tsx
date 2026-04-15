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
    </svg>
  ),
  'ui-action': (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
      <rect x="2" y="5" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 8H10M8 6.5V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

const HANDLE_STYLE = {
  background: '#2e3340',
  width: 7,
  height: 7,
  border: '1px solid #3a3f4a',
};

function CanvasNode({ data, selected }: NodeProps<CanvasNodeData>) {
  const typeConfig = NODE_TYPE_CONFIGS[data.type] || NODE_TYPE_CONFIGS.page;
  const statusConfig = STATUS_CONFIGS[data.status] || STATUS_CONFIGS.stable;

  const hasContent = !!(
    data.notes ||
    data.prompt ||
    (data.tasks && data.tasks.length > 0) ||
    (data.bugs && data.bugs.length > 0)
  );

  const sideBorderColor = selected ? typeConfig.accentColor : '#252830';

  return (
    <div
      style={{
        background: '#1a1d23',
        borderTop: `1px solid ${sideBorderColor}`,
        borderRight: `1px solid ${sideBorderColor}`,
        borderBottom: `1px solid ${sideBorderColor}`,
        borderLeft: `3px solid ${typeConfig.accentColor}`,
        borderRadius: '5px',
        width: '168px',
        padding: '8px 10px 7px 8px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <div style={{ color: '#5a6070', flexShrink: 0, display: 'flex', alignItems: 'center', lineHeight: 0 }}>
          {NODE_TYPE_ICONS[data.type]}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#dde3ed',
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
              fontSize: '9px',
              color: '#3d4455',
              fontFamily: 'monospace',
              marginTop: '1px',
              lineHeight: '1.2',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {typeConfig.label}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
          {hasContent && (
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: typeConfig.accentColor,
                opacity: 0.6,
              }}
            />
          )}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusConfig.color,
            }}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="right" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} id="left" style={HANDLE_STYLE} />
    </div>
  );
}

export default memo(CanvasNode);
