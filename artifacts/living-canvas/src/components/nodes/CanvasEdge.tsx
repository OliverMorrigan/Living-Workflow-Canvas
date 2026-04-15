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
    borderRadius: 6,
  });

  const relation = data?.relation || 'navigates-to';
  const edgeConfig = EDGE_RELATION_CONFIGS[relation] || EDGE_RELATION_CONFIGS['navigates-to'];
  const color = selected ? '#60a5fa' : '#323844';
  const label = data?.label || edgeConfig.label;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? 2 : 1.2,
          strokeOpacity: 1,
        }}
        id={id}
      />
      {selected && label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: '9px',
              fontFamily: 'monospace',
              background: '#1a1d23',
              color: '#60a5fa',
              border: '1px solid #252830',
              borderRadius: '3px',
              padding: '2px 5px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
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
