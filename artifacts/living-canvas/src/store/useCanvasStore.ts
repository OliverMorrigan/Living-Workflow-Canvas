import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Node, Edge } from '@xyflow/react';
import type { CanvasNodeData, CanvasEdgeData, Snapshot, SnapshotDiff } from '../types';
import { sampleNodes, sampleEdges } from '../data/sampleData';
import { v4 as uuidv4 } from 'uuid';

type HistoryEntry = {
  nodes: Node<CanvasNodeData>[];
  edges: Edge<CanvasEdgeData>[];
};

const MAX_HISTORY = 50;

interface CanvasStore {
  nodes: Node<CanvasNodeData>[];
  edges: Edge<CanvasEdgeData>[];
  selectedNodeId: string | null;
  snapshots: Snapshot[];
  isInspectorOpen: boolean;
  isSnapshotPanelOpen: boolean;
  compareSnapshot1: string | null;
  compareSnapshot2: string | null;
  isPlanPanelOpen: boolean;
  generatedPlan: string | null;
  isGeneratingPlan: boolean;
  isCommandBarOpen: boolean;

  // Undo/Redo (not persisted)
  _past: HistoryEntry[];
  _future: HistoryEntry[];

  setNodes: (nodes: Node<CanvasNodeData>[]) => void;
  setEdges: (edges: Edge<CanvasEdgeData>[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
  addNode: (node: Node<CanvasNodeData>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge<CanvasEdgeData>) => void;
  removeEdge: (id: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  takeSnapshot: (name: string, description?: string) => void;
  deleteSnapshot: (id: string) => void;
  restoreSnapshot: (id: string) => void;
  getSnapshotDiff: (id1: string, id2: string) => SnapshotDiff | null;

  setInspectorOpen: (open: boolean) => void;
  setSnapshotPanelOpen: (open: boolean) => void;
  setCompareSnapshot1: (id: string | null) => void;
  setCompareSnapshot2: (id: string | null) => void;
  setPlanPanelOpen: (open: boolean) => void;
  setGeneratedPlan: (plan: string | null) => void;
  setGeneratingPlan: (generating: boolean) => void;
  setCommandBarOpen: (open: boolean) => void;

  resetToSample: () => void;
}

function cloneGraph(nodes: Node<CanvasNodeData>[], edges: Edge<CanvasEdgeData>[]): HistoryEntry {
  return {
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      nodes: sampleNodes,
      edges: sampleEdges,
      selectedNodeId: null,
      snapshots: [],
      isInspectorOpen: false,
      isSnapshotPanelOpen: false,
      compareSnapshot1: null,
      compareSnapshot2: null,
      isPlanPanelOpen: false,
      generatedPlan: null,
      isGeneratingPlan: false,
      isCommandBarOpen: false,
      _past: [],
      _future: [],

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setSelectedNodeId: (id) => set({ selectedNodeId: id, isInspectorOpen: id !== null }),

      updateNodeData: (id, data) =>
        set((state) => {
          const past = [...state._past, cloneGraph(state.nodes, state.edges)].slice(-MAX_HISTORY);
          return {
            _past: past,
            _future: [],
            nodes: state.nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, ...data } } : n
            ),
          };
        }),

      addNode: (node) =>
        set((state) => {
          const past = [...state._past, cloneGraph(state.nodes, state.edges)].slice(-MAX_HISTORY);
          return { _past: past, _future: [], nodes: [...state.nodes, node] };
        }),

      removeNode: (id) =>
        set((state) => {
          const past = [...state._past, cloneGraph(state.nodes, state.edges)].slice(-MAX_HISTORY);
          return {
            _past: past,
            _future: [],
            nodes: state.nodes.filter((n) => n.id !== id),
            edges: state.edges.filter((e) => e.source !== id && e.target !== id),
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
            isInspectorOpen: state.selectedNodeId === id ? false : state.isInspectorOpen,
          };
        }),

      addEdge: (edge) =>
        set((state) => {
          const past = [...state._past, cloneGraph(state.nodes, state.edges)].slice(-MAX_HISTORY);
          return { _past: past, _future: [], edges: [...state.edges, edge] };
        }),

      removeEdge: (id) =>
        set((state) => {
          const past = [...state._past, cloneGraph(state.nodes, state.edges)].slice(-MAX_HISTORY);
          return { _past: past, _future: [], edges: state.edges.filter((e) => e.id !== id) };
        }),

      undo: () =>
        set((state) => {
          if (state._past.length === 0) return {};
          const past = [...state._past];
          const entry = past.pop()!;
          const future = [cloneGraph(state.nodes, state.edges), ...state._future].slice(0, MAX_HISTORY);
          return { _past: past, _future: future, nodes: entry.nodes, edges: entry.edges };
        }),

      redo: () =>
        set((state) => {
          if (state._future.length === 0) return {};
          const future = [...state._future];
          const entry = future.shift()!;
          const past = [...state._past, cloneGraph(state.nodes, state.edges)].slice(-MAX_HISTORY);
          return { _past: past, _future: future, nodes: entry.nodes, edges: entry.edges };
        }),

      canUndo: () => get()._past.length > 0,
      canRedo: () => get()._future.length > 0,

      takeSnapshot: (name, description) => {
        const { nodes, edges } = get();
        const snapshot: Snapshot = {
          id: uuidv4(),
          name,
          timestamp: Date.now(),
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          description,
        };
        set((state) => ({
          snapshots: [snapshot, ...state.snapshots],
        }));
      },

      deleteSnapshot: (id) =>
        set((state) => ({
          snapshots: state.snapshots.filter((s) => s.id !== id),
          compareSnapshot1: state.compareSnapshot1 === id ? null : state.compareSnapshot1,
          compareSnapshot2: state.compareSnapshot2 === id ? null : state.compareSnapshot2,
        })),

      restoreSnapshot: (id) => {
        const snapshot = get().snapshots.find((s) => s.id === id);
        if (snapshot) {
          const past = [...get()._past, cloneGraph(get().nodes, get().edges)].slice(-MAX_HISTORY);
          set({ nodes: snapshot.nodes, edges: snapshot.edges, _past: past, _future: [] });
        }
      },

      getSnapshotDiff: (id1, id2) => {
        const snapshots = get().snapshots;
        const s1 = snapshots.find((s) => s.id === id1);
        const s2 = snapshots.find((s) => s.id === id2);
        if (!s1 || !s2) return null;

        const s1NodeIds = new Set(s1.nodes.map((n) => n.id));
        const s2NodeIds = new Set(s2.nodes.map((n) => n.id));
        const s1EdgeIds = new Set(s1.edges.map((e) => e.id));
        const s2EdgeIds = new Set(s2.edges.map((e) => e.id));

        return {
          nodesAdded: s2.nodes.filter((n) => !s1NodeIds.has(n.id)).map((n) => n.data.label || n.id),
          nodesRemoved: s1.nodes.filter((n) => !s2NodeIds.has(n.id)).map((n) => n.data.label || n.id),
          nodesChanged: s2.nodes
            .filter((n) => {
              if (!s1NodeIds.has(n.id)) return false;
              const s1Node = s1.nodes.find((sn) => sn.id === n.id);
              return s1Node && JSON.stringify(s1Node.data) !== JSON.stringify(n.data);
            })
            .map((n) => n.data.label || n.id),
          edgesAdded: s2.edges.filter((e) => !s1EdgeIds.has(e.id)).map((e) => `${e.source} → ${e.target}`),
          edgesRemoved: s1.edges.filter((e) => !s2EdgeIds.has(e.id)).map((e) => `${e.source} → ${e.target}`),
          edgesChanged: s2.edges
            .filter((e) => {
              if (!s1EdgeIds.has(e.id)) return false;
              const s1Edge = s1.edges.find((se) => se.id === e.id);
              return s1Edge && JSON.stringify(s1Edge.data) !== JSON.stringify(e.data);
            })
            .map((e) => `${e.source} → ${e.target}`),
        };
      },

      setInspectorOpen: (open) => set({ isInspectorOpen: open }),
      setSnapshotPanelOpen: (open) => set({ isSnapshotPanelOpen: open }),
      setCompareSnapshot1: (id) => set({ compareSnapshot1: id }),
      setCompareSnapshot2: (id) => set({ compareSnapshot2: id }),
      setPlanPanelOpen: (open) => set({ isPlanPanelOpen: open }),
      setGeneratedPlan: (plan) => set({ generatedPlan: plan }),
      setGeneratingPlan: (generating) => set({ isGeneratingPlan: generating }),
      setCommandBarOpen: (open) => set({ isCommandBarOpen: open }),

      resetToSample: () =>
        set({
          nodes: sampleNodes,
          edges: sampleEdges,
          selectedNodeId: null,
          isInspectorOpen: false,
          _past: [],
          _future: [],
        }),
    }),
    {
      name: 'living-canvas-store',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        snapshots: state.snapshots,
      }),
    }
  )
);
