import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { CanvasEdgeData } from '../../types';
import { EDGE_RELATION_CONFIGS } from './nodeConfig';

function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relation = data?.relation || 'navigates-to';
  const edgeConfig = EDGE_RELATION_CONFIGS[relation] || EDGE_RELATION_CONFIGS['navigates-to'];
  const color = selected ? '#3b82f6' : 'rgba(100, 116, 139, 0.4)';
  const label = data?.label || edgeConfig.label;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: relation === 'queries' ? '8,6' : relation === 'calls-api' ? '4,4' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        id={id}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: '10px',
              fontFamily: 'monospace',
              background: selected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 17, 21, 0.8)',
              backdropFilter: 'blur(4px)',
              color: selected ? '#60a5fa' : '#64748b',
              border: `1px solid ${selected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
              borderRadius: '6px',
              padding: '3px 8px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              opacity: selected ? 1 : 0.6,
              zIndex: selected ? 1000 : 1,
            }}
            className={selected ? "" : "nodrag nopan"}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CanvasEdge);
