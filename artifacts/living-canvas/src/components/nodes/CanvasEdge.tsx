import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const relation = data?.relation || 'navigates-to';
  const edgeConfig = EDGE_RELATION_CONFIGS[relation] || EDGE_RELATION_CONFIGS['navigates-to'];
  const color = selected ? '#60a5fa' : edgeConfig.color;
  const label = data?.label || edgeConfig.label;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeOpacity: selected ? 1 : 0.6,
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
        id={id}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: '9px',
              fontFamily: 'monospace',
              background: 'rgba(15,20,30,0.85)',
              color: color,
              border: `1px solid ${color}44`,
              borderRadius: '4px',
              padding: '2px 5px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(4px)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CanvasEdge);
