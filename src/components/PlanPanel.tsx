import React from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

export default function PlanPanel() {
  const { isPlanPanelOpen, setPlanPanelOpen, generatedPlan, setGeneratedPlan, isGeneratingPlan } = useCanvasStore();

  if (!isPlanPanelOpen) return null;

  return (
    <div
      className="panel-animate"
      style={{
        width: '360px',
        height: '100%',
        background: 'hsl(222 18% 9%)',
        borderLeft: '1px solid hsl(220 14% 14%)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid hsl(220 14% 14%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M2 10L6 6L9 9L14 4" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 14H14V8" stroke="#c4b5fd" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: '#c4b5fd' }}>Agent Plan</span>
          </div>
          <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', marginTop: '1px' }}>
            Context-aware change plan
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {generatedPlan && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedPlan);
              }}
              title="Copy to clipboard"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '5px',
                padding: '4px 8px',
                color: '#c4b5fd',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          )}
          <button
            onClick={() => setPlanPanelOpen(false)}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px' }}>
        {isGeneratingPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(139,92,246,0.3)',
                borderTop: '2px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div style={{ color: '#c4b5fd', fontSize: '12px' }}>Generating plan...</div>
            <div style={{ color: '#475569', fontSize: '10px', fontFamily: 'monospace', maxWidth: '200px', textAlign: 'center' }}>
              Analyzing canvas context and node connections
            </div>
          </div>
        )}

        {!isGeneratingPlan && !generatedPlan && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155' }}>
            <div style={{ marginBottom: '8px', opacity: 0.5 }}>
              <svg viewBox="0 0 32 32" fill="none" width="32" height="32" style={{ margin: '0 auto', display: 'block' }}>
                <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 12H22M10 16H18M10 20H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontSize: '12px' }}>No plan generated yet.</div>
            <div style={{ fontSize: '10px', marginTop: '4px', color: '#1e293b' }}>
              Click "Ask Agent" or use the Prompt tab on a node.
            </div>
          </div>
        )}

        {!isGeneratingPlan && generatedPlan && (
          <div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '11.5px',
                lineHeight: '1.7',
                color: '#94a3b8',
                whiteSpace: 'pre-wrap',
              }}
            >
              <MarkdownRenderer content={generatedPlan} />
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid hsl(220 14% 14%)' }}>
              <button
                onClick={() => setGeneratedPlan(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid hsl(220 14% 20%)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  color: '#475569',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <div key={i} style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 700, marginBottom: '6px', marginTop: i > 0 ? '12px' : 0 }}>
              {line.slice(2)}
            </div>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <div key={i} style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 600, marginBottom: '4px', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {line.slice(3)}
            </div>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const text = line.slice(2);
          return (
            <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '2px', paddingLeft: '8px' }}>
              <span style={{ color: '#3b82f6', flexShrink: 0 }}>·</span>
              <span style={{ color: '#94a3b8' }}>{renderInline(text)}</span>
            </div>
          );
        }
        if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
          const done = line.startsWith('- [x]');
          const text = line.slice(6);
          return (
            <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '3px', paddingLeft: '8px' }}>
              <span style={{ color: done ? '#22c55e' : '#475569', flexShrink: 0, fontSize: '10px', marginTop: '1px' }}>
                {done ? '✓' : '○'}
              </span>
              <span style={{ color: done ? '#475569' : '#94a3b8', textDecoration: done ? 'line-through' : 'none' }}>
                {text}
              </span>
            </div>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <div key={i} style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '2px' }}>
              {line.slice(2, -2)}
            </div>
          );
        }
        if (line === '') {
          return <div key={i} style={{ height: '6px' }} />;
        }
        return (
          <div key={i} style={{ marginBottom: '2px', color: '#94a3b8' }}>
            {renderInline(line)}
          </div>
        );
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#e2e8f0' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            background: 'rgba(59,130,246,0.15)',
            color: '#93c5fd',
            padding: '1px 4px',
            borderRadius: '3px',
            fontSize: '10px',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
