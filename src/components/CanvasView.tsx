import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
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
  markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#3b82f6' },
  data: { relation: 'navigates-to', label: '' },
};

function FlowController() {
  const { fitView, setViewport, getViewport } = useReactFlow();
  const { nodes } = useCanvasStore();

  useEffect(() => {
    const onFitView = () => fitView({ padding: 0.2, duration: 400 });
    const onZoomReset = () => {
      const { x, y } = getViewport();
      setViewport({ x, y, zoom: 1 }, { duration: 300 });
    };
    const onFocusNode = (e: CustomEvent) => {
      const node = nodes.find((n) => n.id === e.detail?.id);
      if (node) {
        fitView({ nodes: [{ id: node.id }], padding: 0.5, duration: 500 });
      }
    };

    window.addEventListener('flow:fitView', onFitView);
    window.addEventListener('flow:zoomReset', onZoomReset);
    window.addEventListener('flow:focusNode', onFocusNode as EventListener);
    return () => {
      window.removeEventListener('flow:fitView', onFitView);
      window.removeEventListener('flow:zoomReset', onZoomReset);
      window.removeEventListener('flow:focusNode', onFocusNode as EventListener);
    };
  }, [fitView, setViewport, getViewport, nodes]);

  return null;
}

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
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#3b82f6' },
        data: { relation: 'navigates-to', label: '' },
      };
      storeAddEdge(newEdge);
    },
    [storeAddEdge]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  return (
    <div className="flex-1 relative overflow-hidden bg-[#0b0c10]">
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
        minZoom={0.05}
        maxZoom={4}
        className="selection-layer"
        proOptions={{ hideAttribution: true }}
        elevateEdgesOnSelect
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={'partial' as never}
      >
        <FlowController />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e2128"
          className="opacity-40"
        />
        <Controls 
          className="!bg-[#1a1d23] !border-[#252830] !rounded-lg !overflow-hidden !shadow-2xl mb-4 ml-4" 
          showInteractive={false} 
        />
        <MiniMap
          className="!bg-[#131518] !border-[#252830] !rounded-lg !shadow-2xl mr-4 mb-4"
          maskColor="rgba(10,12,18,0.7)"
          nodeColor={(node: Node) => {
            const data = node.data as CanvasNodeData;
            return NODE_TYPE_CONFIGS[data.type]?.accentColor || '#3b82f6';
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Shortcuts Legend */}
      <div className="absolute bottom-6 left-24 flex flex-col gap-1.5 pointer-events-none z-10 opacity-40 hover:opacity-100 transition-opacity duration-300">
        {[
          ['⌘K', 'Command Bar'],
          ['N', 'New Node'],
          ['Del', 'Remove'],
          ['F', 'Fit View'],
          ['0', '100% Zoom'],
          ['⌘Z', 'Undo'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-3">
            <kbd className="min-w-[32px] px-1.5 py-0.5 bg-[#13151a] border border-[#1e2128] rounded text-[10px] font-mono text-gray-500 text-center">
              {key}
            </kbd>
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Context Indicator */}
      {selectedNodeId && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-[#13151a]/90 backdrop-blur-md border border-white/5 rounded-full shadow-2xl pointer-events-none animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
          <span className="text-[12px] font-medium text-gray-300">
            Editing: <span className="text-white font-bold">{(nodes.find((n) => n.id === selectedNodeId)?.data as CanvasNodeData)?.label}</span>
          </span>
          <div className="h-3 w-[1px] bg-white/10" />
          <span className="text-[10px] text-gray-500 font-mono">DOUBLE-CLICK TO RENAME</span>
        </div>
      )}

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 flex items-center justify-center border border-white/10 rounded-2xl bg-[#13151a]/50 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-blue-500/50">
                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-400 mb-2">Living Software Canvas</h2>
          <p className="text-sm text-gray-600 font-mono mb-8 max-w-sm text-center px-6">
            Architecture isn&apos;t static. Scan your project or start building visually.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[11px] text-gray-500 font-mono">
              <kbd className="bg-white/10 px-1 rounded text-gray-300">N</kbd> Create node
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[11px] text-gray-500 font-mono">
              <kbd className="bg-white/10 px-1 rounded text-gray-300">⌘K</kbd> Search actions
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
