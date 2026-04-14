import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CanvasNode from './nodes/CanvasNode';
import CanvasEdge from './nodes/CanvasEdge';
import { useCanvasStore } from '../store/useCanvasStore';
import type { CanvasNodeData, CanvasEdgeData } from '../types';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = { canvasNode: CanvasNode };
const edgeTypes = { canvasEdge: CanvasEdge };

const defaultEdgeOptions = {
  type: 'canvasEdge',
  markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#60a5fa' },
  data: { relation: 'navigates-to', label: 'navigates to' },
};

export default function CanvasView() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNodeId,
    selectedNodeId,
    addEdge: storeAddEdge,
  } = useCanvasStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updated = applyNodeChanges(changes, nodes as Node<CanvasNodeData>[]);
      setNodes(updated as Node<CanvasNodeData>[]);
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updated = applyEdgeChanges(changes, edges as Edge<CanvasEdgeData>[]);
      setEdges(updated as Edge<CanvasEdgeData>[]);
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge<CanvasEdgeData> = {
        id: uuidv4(),
        source: connection.source ?? '',
        target: connection.target ?? '',
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: 'canvasEdge',
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
        data: { relation: 'navigates-to', label: 'navigates to' },
      };
      storeAddEdge(newEdge);
    },
    [storeAddEdge]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes as Node<CanvasNodeData>[]}
        edges={edges as Edge<CanvasEdgeData>[]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions as object}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(148,163,184,0.08)"
          style={{ background: 'hsl(222 20% 7%)' }}
        />
        <Controls
          style={{ bottom: 20, left: 20 }}
          showInteractive={false}
        />
        <MiniMap
          style={{ bottom: 20, right: 20 }}
          maskColor="rgba(10, 15, 25, 0.7)"
          nodeColor={(node: Node) => {
            const colors: Record<string, string> = {
              page: '#3b82f6',
              route: '#34d399',
              component: '#a78bfa',
              api: '#f59e0b',
              auth: '#f87171',
              middleware: '#22d3ee',
              database: '#fb7185',
              gateway: '#fb923c',
              'ui-action': '#2dd4bf',
            };
            const data = node.data as CanvasNodeData;
            return colors[data.type] || '#60a5fa';
          }}
        />
      </ReactFlow>

      {/* Empty canvas hint */}
      {nodes.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.2 }}>◈</div>
          <div style={{ fontSize: '14px', color: '#334155' }}>Canvas is empty</div>
          <div style={{ fontSize: '11px', color: '#1e293b', marginTop: '4px' }}>
            Use the palette on the left to add nodes
          </div>
        </div>
      )}

      {/* Node counter overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15,20,30,0.7)',
          border: '1px solid hsl(220 14% 16%)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#475569',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {nodes.length} nodes · {edges.length} edges
        {selectedNodeId && (
          <span style={{ color: '#60a5fa', marginLeft: '8px' }}>
            · {(nodes.find((n) => n.id === selectedNodeId)?.data as CanvasNodeData)?.label} selected
          </span>
        )}
      </div>
    </div>
  );
}
