export type NodeType =
  | 'page'
  | 'route'
  | 'component'
  | 'api'
  | 'auth'
  | 'middleware'
  | 'database'
  | 'gateway'
  | 'ui-action';

export type NodeStatus = 'stable' | 'in-progress' | 'planned' | 'deprecated' | 'broken';

export type EdgeRelation =
  | 'navigates-to'
  | 'renders'
  | 'calls-api'
  | 'redirects'
  | 'auth-guards'
  | 'queries'
  | 'proxies'
  | 'triggers'
  | 'depends-on';

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface Bug {
  id: string;
  text: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'screenshot' | 'file' | 'link';
  url?: string;
}

export interface CanvasNodeData {
  id: string;
  type: NodeType;
  label: string;
  status: NodeStatus;
  routePath?: string;
  filePath?: string;
  description?: string;
  notes?: string;
  prompt?: string;
  tasks: Task[];
  bugs: Bug[];
  attachments: Attachment[];
  [key: string]: unknown;
}

export interface CanvasEdgeData {
  relation: EdgeRelation;
  label?: string;
  [key: string]: unknown;
}

export interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  nodes: import('@xyflow/react').Node<CanvasNodeData>[];
  edges: import('@xyflow/react').Edge<CanvasEdgeData>[];
  description?: string;
}

export interface SnapshotDiff {
  nodesAdded: string[];
  nodesRemoved: string[];
  nodesChanged: string[];
  edgesAdded: string[];
  edgesRemoved: string[];
  edgesChanged: string[];
}
