import type { NodeType, EdgeRelation } from '../../types';

export interface NodeTypeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowClass: string;
  icon: string;
  description: string;
}

export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  page: {
    label: 'Page',
    color: '#60a5fa',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    glowClass: 'node-glow-blue',
    icon: '⬜',
    description: 'A Next.js page route',
  },
  route: {
    label: 'Route',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
    glowClass: 'node-glow-green',
    icon: '⟶',
    description: 'A URL route or path segment',
  },
  component: {
    label: 'Component',
    color: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.08)',
    borderColor: 'rgba(167, 139, 250, 0.35)',
    glowClass: 'node-glow-purple',
    icon: '◈',
    description: 'A React component',
  },
  api: {
    label: 'API',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    glowClass: 'node-glow-amber',
    icon: '⚡',
    description: 'An API endpoint',
  },
  auth: {
    label: 'Auth',
    color: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.08)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
    glowClass: 'node-glow-red',
    icon: '🔐',
    description: 'Authentication provider or check',
  },
  middleware: {
    label: 'Middleware',
    color: '#22d3ee',
    bgColor: 'rgba(34, 211, 238, 0.08)',
    borderColor: 'rgba(34, 211, 238, 0.35)',
    glowClass: 'node-glow-cyan',
    icon: '⧖',
    description: 'Next.js middleware or proxy',
  },
  database: {
    label: 'Database',
    color: '#fb7185',
    bgColor: 'rgba(251, 113, 133, 0.08)',
    borderColor: 'rgba(251, 113, 133, 0.35)',
    glowClass: 'node-glow-pink',
    icon: '⬡',
    description: 'A database or data store',
  },
  gateway: {
    label: 'Gateway',
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: 'rgba(251, 146, 60, 0.35)',
    glowClass: 'node-glow-orange',
    icon: '◆',
    description: 'Payment, email, or external gateway',
  },
  'ui-action': {
    label: 'UI Action',
    color: '#2dd4bf',
    bgColor: 'rgba(45, 212, 191, 0.08)',
    borderColor: 'rgba(45, 212, 191, 0.35)',
    glowClass: 'node-glow-teal',
    icon: '▶',
    description: 'Button, link, or user action',
  },
};

export const STATUS_CONFIGS = {
  stable: { label: 'Stable', color: '#22c55e', dot: 'bg-green-500' },
  'in-progress': { label: 'In Progress', color: '#f59e0b', dot: 'bg-amber-500' },
  planned: { label: 'Planned', color: '#60a5fa', dot: 'bg-blue-400' },
  deprecated: { label: 'Deprecated', color: '#6b7280', dot: 'bg-gray-500' },
  broken: { label: 'Broken', color: '#ef4444', dot: 'bg-red-500' },
};

export const EDGE_RELATION_CONFIGS: Record<EdgeRelation, { label: string; color: string }> = {
  'navigates-to': { label: 'navigates to', color: '#60a5fa' },
  renders: { label: 'renders', color: '#a78bfa' },
  'calls-api': { label: 'calls API', color: '#f59e0b' },
  redirects: { label: 'redirects', color: '#34d399' },
  'auth-guards': { label: 'auth guards', color: '#f87171' },
  queries: { label: 'queries', color: '#fb7185' },
  proxies: { label: 'proxies', color: '#22d3ee' },
  triggers: { label: 'triggers', color: '#fb923c' },
  'depends-on': { label: 'depends on', color: '#6b7280' },
};
