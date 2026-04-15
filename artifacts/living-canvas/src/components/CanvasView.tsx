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
import { NODE_TYPE_CONFIGS } from './nodes/nodeConfig';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = { canvasNode: CanvasNode };
const edgeTypes = { canvasEdge: CanvasEdge };

const defaultEdgeOptions = {
  type: 'canvasEdge',
  markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#323844' },
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
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#323844' },
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
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.15}
        maxZoom={2.5}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e2128"
          style={{ background: '#111216' }}
        />
        <Controls style={{ bottom: 16, left: 16 }} showInteractive={false} />
        <MiniMap
          style={{ bottom: 16, right: 16, background: '#131518' }}
          maskColor="rgba(10,12,18,0.75)"
          nodeColor={(node: Node) => {
            const data = node.data as CanvasNodeData;
            return NODE_TYPE_CONFIGS[data.type]?.accentColor || '#3b82f6';
          }}
        />
      </ReactFlow>

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
          <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.08 }}>◈</div>
          <div style={{ fontSize: '12px', color: '#252830', fontFamily: 'monospace' }}>Canvas vazio</div>
          <div style={{ fontSize: '10px', color: '#1e2128', marginTop: '4px', fontFamily: 'monospace' }}>
            Use a paleta à esquerda · Pressione <kbd style={{ background: '#1a1d23', border: '1px solid #252830', borderRadius: '2px', padding: '0 4px', fontSize: '9px' }}>N</kbd> para adicionar
          </div>
        </div>
      )}

      {/* Shortcuts legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {[
          ['N', 'Novo nó'],
          ['Del', 'Remover'],
          ['Esc', 'Deselecionar'],
          ['/', 'Focar prompt'],
          ['⌘S', 'Snapshot'],
        ].map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd
              style={{
                background: '#13151a',
                border: '1px solid #1e2128',
                borderRadius: '3px',
                padding: '1px 5px',
                fontSize: '8px',
                fontFamily: 'monospace',
                color: '#2e3340',
              }}
            >
              {key}
            </kbd>
            <span style={{ fontSize: '8px', color: '#1e2128', fontFamily: 'monospace' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Counter badge */}
      {selectedNodeId && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#13151a',
            border: '1px solid #1e2128',
            borderRadius: '4px',
            padding: '3px 10px',
            fontSize: '9px',
            fontFamily: 'monospace',
            color: '#3d4455',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <span style={{ color: '#6b7280' }}>
            {(nodes.find((n) => n.id === selectedNodeId)?.data as CanvasNodeData)?.label}
          </span>
          {' '}selecionado
        </div>
      )}
    </div>
  );
}
