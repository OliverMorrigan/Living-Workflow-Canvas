import type { NodeType, EdgeRelation } from '../../types';

export interface NodeTypeConfig {
  label: string;
  accentColor: string;
  description: string;
}

export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  page: {
    label: 'Page',
    accentColor: '#3b82f6',
    description: 'A Next.js page route',
  },
  route: {
    label: 'Route',
    accentColor: '#10b981',
    description: 'A URL route or path segment',
  },
  component: {
    label: 'Component',
    accentColor: '#8b5cf6',
    description: 'A React component',
  },
  api: {
    label: 'API',
    accentColor: '#f59e0b',
    description: 'An API endpoint',
  },
  auth: {
    label: 'Auth',
    accentColor: '#ef4444',
    description: 'Authentication provider or check',
  },
  middleware: {
    label: 'Middleware',
    accentColor: '#06b6d4',
    description: 'Next.js middleware or proxy',
  },
  database: {
    label: 'Database',
    accentColor: '#ec4899',
    description: 'A database or data store',
  },
  gateway: {
    label: 'Gateway',
    accentColor: '#f97316',
    description: 'Payment, email, or external gateway',
  },
  'ui-action': {
    label: 'UI Action',
    accentColor: '#14b8a6',
    description: 'Button, link, or user action',
  },
};

export const STATUS_CONFIGS = {
  stable: { label: 'Stable', color: '#22c55e' },
  'in-progress': { label: 'In Progress', color: '#f59e0b' },
  planned: { label: 'Planned', color: '#60a5fa' },
  deprecated: { label: 'Deprecated', color: '#6b7280' },
  broken: { label: 'Broken', color: '#ef4444' },
};

export const EDGE_RELATION_CONFIGS: Record<EdgeRelation, { label: string; color: string }> = {
  'navigates-to': { label: 'navigates to', color: '#4b5563' },
  renders: { label: 'renders', color: '#4b5563' },
  'calls-api': { label: 'calls API', color: '#4b5563' },
  redirects: { label: 'redirects', color: '#4b5563' },
  'auth-guards': { label: 'auth guards', color: '#4b5563' },
  queries: { label: 'queries', color: '#4b5563' },
  proxies: { label: 'proxies', color: '#4b5563' },
  triggers: { label: 'triggers', color: '#4b5563' },
  'depends-on': { label: 'depends on', color: '#4b5563' },
};
