import React from 'react';
import type { NodeType } from '../types';
import { NODE_TYPE_CONFIGS } from './nodes/nodeConfig';
import { useCanvasStore } from '../store/useCanvasStore';
import { v4 as uuidv4 } from 'uuid';

const NODE_TYPES: NodeType[] = [
  'page',
  'route',
  'component',
  'api',
  'auth',
  'middleware',
  'database',
  'gateway',
  'ui-action',
];

const NODE_ICONS_SVG: Record<NodeType, React.ReactNode> = {
  page: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
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
      <rect x="3" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="3" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path d="M3 5L8 2L13 5V11L8 14L3 11V5Z" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  auth: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 7V5.5C5.5 3.57 6.79 2 8 2C9.21 2 10.5 3.57 10.5 5.5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  middleware: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 3V8L11 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  database: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <ellipse cx="8" cy="4.5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3 4.5V11.5C3 12.6 5.24 13.5 8 13.5C10.76 13.5 13 12.6 13 11.5V4.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3 8C3 9.1 5.24 10 8 10C10.76 10 13 9.1 13 8" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  gateway: (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  'ui-action': (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <rect x="2" y="5" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 8H10M8 6.5V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

export default function LeftPalette() {
  const { addNode } = useCanvasStore();

  const handleAddNode = (type: NodeType) => {
    const config = NODE_TYPE_CONFIGS[type];
    const id = uuidv4();
    const newNode = {
      id,
      type: 'canvasNode',
      position: {
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      data: {
        id,
        type,
        label: `New ${config.label}`,
        status: 'planned' as const,
        routePath: '',
        filePath: '',
        description: '',
        notes: '',
        prompt: '',
        tasks: [],
        bugs: [],
        attachments: [],
      },
    };
    addNode(newNode);
  };

  return (
    <div
      style={{
        width: '64px',
        height: '100%',
        background: 'hsl(222 18% 9%)',
        borderRight: '1px solid hsl(220 14% 16%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: '4px',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize: '8px',
          fontFamily: 'monospace',
          color: 'hsl(220 10% 40%)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '8px',
          padding: '0 4px',
          textAlign: 'center',
        }}
      >
        NODES
      </div>

      {NODE_TYPES.map((type) => {
        const config = NODE_TYPE_CONFIGS[type];
        return (
          <button
            key={type}
            onClick={() => handleAddNode(type)}
            title={`Add ${config.label}`}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${config.borderColor}`,
              background: config.bgColor,
              color: config.color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '2px',
              transition: 'all 0.15s',
              padding: '4px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = `${config.color}20`;
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = config.bgColor;
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            {NODE_ICONS_SVG[type]}
            <span
              style={{
                fontSize: '7px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: '1',
              }}
            >
              {config.label.length > 6 ? config.label.slice(0, 5) : config.label}
            </span>
          </button>
        );
      })}

      <div
        style={{
          marginTop: 'auto',
          width: '36px',
          height: '1px',
          background: 'hsl(220 14% 16%)',
        }}
      />
      <div
        style={{
          fontSize: '8px',
          color: 'hsl(220 10% 35%)',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '0 6px',
          lineHeight: '1.4',
        }}
      >
        Click to add
      </div>
    </div>
  );
}
