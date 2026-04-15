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

export default function LeftPalette() {
  const { addNode } = useCanvasStore();

  const handleAddNode = (type: NodeType) => {
    const config = NODE_TYPE_CONFIGS[type];
    const id = uuidv4();
    addNode({
      id,
      type: 'canvasNode',
      position: {
        x: 200 + Math.random() * 300,
        y: 150 + Math.random() * 250,
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
    });
  };

  return (
    <div
      style={{
        width: '108px',
        height: '100%',
        background: '#13151a',
        borderRight: '1px solid #1e2128',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: '10px 10px 6px',
          fontSize: '8px',
          fontFamily: 'monospace',
          color: '#2e3340',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderBottom: '1px solid #1e2128',
        }}
      >
        Nodes
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
        {NODE_TYPES.map((type) => {
          const config = NODE_TYPE_CONFIGS[type];
          return (
            <PaletteRow
              key={type}
              label={config.label}
              accentColor={config.accentColor}
              onClick={() => handleAddNode(type)}
            />
          );
        })}
      </div>
      <div
        style={{
          padding: '8px 10px',
          borderTop: '1px solid #1e2128',
          fontSize: '8px',
          color: '#252830',
          fontFamily: 'monospace',
          textAlign: 'center',
        }}
      >
        click to add
      </div>
    </div>
  );
}

function PaletteRow({
  label,
  accentColor,
  onClick,
}: {
  label: string;
  accentColor: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        width: '100%',
        padding: '6px 10px',
        background: hovered ? '#1a1d23' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: accentColor,
          flexShrink: 0,
          opacity: hovered ? 1 : 0.5,
        }}
      />
      <span
        style={{
          fontSize: '10px',
          fontFamily: 'monospace',
          color: hovered ? '#8b95a5' : '#3d4455',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </span>
    </button>
  );
}
