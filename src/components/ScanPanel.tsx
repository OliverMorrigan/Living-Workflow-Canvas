import React, { useState, useCallback } from 'react';
import { scanProject, buildBabaluxPreset, type ScanResult } from '../lib/scanner';
import { useCanvasStore } from '../store/useCanvasStore';
import type { CanvasNodeData, CanvasEdgeData } from '../types';
import type { Node, Edge } from '@xyflow/react';

type Phase = 'idle' | 'scanning' | 'done' | 'error';

interface ScanPanelProps {
  onClose: () => void;
}

export default function ScanPanel({ onClose }: ScanPanelProps) {
  const { setNodes, setEdges, takeSnapshot, setSelectedNodeId } = useCanvasStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [gitUrl, setGitUrl] = useState('');

  const applyResult = useCallback(
    (res: ScanResult) => {
      if (importMode === 'replace') {
        setNodes(res.nodes as Node<CanvasNodeData>[]);
        setEdges(res.edges as Edge<CanvasEdgeData>[]);
      } else {
        const store = useCanvasStore.getState();
        const existingIds = new Set(store.nodes.map((n) => n.id));
        const newNodes = res.nodes.filter((n) => !existingIds.has(n.id));
        const existingEdgeIds = new Set(store.edges.map((e) => e.id));
        const newEdges = res.edges.filter((e) => !existingEdgeIds.has(e.id));
        setNodes([...store.nodes, ...newNodes] as Node<CanvasNodeData>[]);
        setEdges([...store.edges, ...newEdges] as Edge<CanvasEdgeData>[]);
      }
      takeSnapshot(`Import: ${res.meta.projectName}`);
      setSelectedNodeId(null);
      setTimeout(() => window.dispatchEvent(new CustomEvent('flow:fitView')), 100);
      onClose();
    },
    [importMode, setNodes, setEdges, takeSnapshot, setSelectedNodeId, onClose]
  );

  const handleBrowse = async () => {
    if (!('showDirectoryPicker' in window)) {
      setError('Seu navegador não suporta seleção de pastas. Use Chrome ou Edge.');
      return;
    }
    try {
      setPhase('scanning');
      setError('');
      const dirHandle = await (window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      const res = await scanProject(dirHandle);
      setResult(res);
      setPhase('done');
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        setPhase('idle');
        return;
      }
      setError((err as Error)?.message || 'Erro ao escanear projeto local');
      setPhase('error');
    }
  };

  const handleGitHubScan = async () => {
    if (!gitUrl.includes('github.com')) {
      setError('Insira uma URL válida do GitHub. Ex: https://github.com/vercel/next.js');
      return;
    }
    try {
      setPhase('scanning');
      setError('');
      const res = await fetch('/api/scan-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: gitUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao escanear GitHub');
      setResult(data);
      setPhase('done');
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Erro ao escanear repositório remoto');
      setPhase('error');
    }
  };

  const handleBabalux = () => {
    const res = buildBabaluxPreset();
    setResult(res);
    setPhase('done');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(7, 8, 10, 0.75)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#13151a',
          border: '1px solid #252830',
          borderRadius: '8px',
          width: '540px',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #1e2128', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#8b95a5' }}>Importar Projeto</div>
            <div style={{ fontSize: '10px', color: '#3d4455', fontFamily: 'monospace', marginTop: '2px' }}>
              Gera automaticamente o mapa de arquitetura do seu projeto
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#2e3340', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
        </div>

        <div style={{ padding: '18px' }}>
          {phase === 'idle' || phase === 'error' ? (
            <>
              {/* Presets */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '8px', color: '#2e3340', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Presets
                </div>
                <button
                  onClick={handleBabalux}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', padding: '12px 14px',
                    background: '#1a1d23', border: '1px solid #252830', borderRadius: '6px',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '6px',
                    background: '#1e2128', border: '1px solid #252830',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0,
                  }}>
                    ✦
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b95a5', fontFamily: 'monospace' }}>Babalux (Califado VIP)</div>
                    <div style={{ fontSize: '9px', color: '#3d4455', marginTop: '2px' }}>Next.js 15 · 17 páginas · Auth · Prisma · Typesense · S3</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '8px', color: '#252830', fontFamily: 'monospace' }}>PRESET</div>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#1e2128' }} />
                <span style={{ fontSize: '9px', color: '#252830', fontFamily: 'monospace' }}>ou escanear projeto local</span>
                <div style={{ flex: 1, height: '1px', background: '#1e2128' }} />
              </div>

              {/* File picker */}
              <button
                onClick={handleBrowse}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '16px 14px',
                  background: 'transparent', border: '1px dashed #252830', borderRadius: '6px',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '6px',
                  background: '#1a1d23', border: '1px solid #1e2128',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M2 5C2 4.45 2.45 4 3 4H7L9 6H13C13.55 6 14 6.45 14 7V12C14 12.55 13.55 13 13 13H3C2.45 13 2 12.55 2 12V5Z" stroke="#3d4455" strokeWidth="1.3"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>Selecionar pasta do projeto</div>
                  <div style={{ fontSize: '9px', color: '#2e3340', marginTop: '2px' }}>
                    Apenas locais (Via Browser API)
                  </div>
                </div>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#1e2128' }} />
                <span style={{ fontSize: '9px', color: '#252830', fontFamily: 'monospace' }}>ou clonar remoto</span>
                <div style={{ flex: 1, height: '1px', background: '#1e2128' }} />
              </div>

              {/* GitHub picker */}
              <div style={{ background: '#1a1d23', border: '1px solid #252830', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: '#8b95a5', fontFamily: 'monospace', marginBottom: '8px' }}>Repositório GitHub (público)</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={gitUrl} 
                    onChange={(e) => setGitUrl(e.target.value)} 
                    placeholder="https://github.com/user/repo" 
                    onKeyDown={(e) => e.key === 'Enter' && handleGitHubScan()}
                    style={{ flex: 1, background: '#111216', border: '1px solid #1e2128', borderRadius: '4px', padding: '8px 10px', color: '#dde3ed', fontSize: '11px', outline: 'none', fontFamily: 'monospace' }} 
                  />
                  <button onClick={handleGitHubScan} style={{ background: '#3b82f6', color: '#0f172a', border: 'none', borderRadius: '4px', padding: '0 16px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'monospace' }}>
                    Clonar
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#1a0a0a', border: '1px solid #3b1515', borderRadius: '4px', fontSize: '10px', color: '#ef4444', fontFamily: 'monospace' }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: '14px', padding: '10px 12px', background: '#0f1116', border: '1px solid #1a1d23', borderRadius: '4px', fontSize: '9px', color: '#2e3340', fontFamily: 'monospace', lineHeight: '1.7' }}>
                O scanner lê apenas a estrutura de arquivos localmente no seu browser.<br/>
                Nenhum dado é enviado para servidores. Funciona offline.
              </div>
            </>
          ) : phase === 'scanning' ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28" style={{ margin: '0 auto 12px', display: 'block', color: '#3b82f6', animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20"/>
              </svg>
              <div style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'monospace' }}>{gitUrl ? 'Clonando e escaneando projeto...' : 'Escaneando estrutura do projeto...'}</div>
              <div style={{ fontSize: '9px', color: '#2e3340', marginTop: '4px' }}>Lendo arquivos e construindo a arquitetura</div>
            </div>
          ) : phase === 'done' && result ? (
            <>
              {/* Result preview */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#8b95a5', marginBottom: '4px', fontFamily: 'monospace' }}>
                  {result.meta.projectName}
                </div>
                <div style={{ fontSize: '9px', color: '#3d4455', marginBottom: '12px' }}>{result.meta.framework}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Nós', value: result.nodes.length },
                    { label: 'Conexões', value: result.edges.length },
                    { label: 'Páginas', value: result.meta.pages },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#1a1d23', border: '1px solid #252830', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#dde3ed', fontFamily: 'monospace' }}>{value}</div>
                      <div style={{ fontSize: '8px', color: '#3d4455', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node type breakdown */}
              <div style={{ marginBottom: '16px' }}>
                {['page', 'route', 'api', 'auth', 'middleware', 'database', 'gateway', 'component'].map((type) => {
                  const count = result.nodes.filter((n) => n.data.type === type).length;
                  if (!count) return null;
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid #1a1d23' }}>
                      <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#3d4455', width: '70px', textTransform: 'uppercase' }}>{type}</span>
                      <div style={{ flex: 1, height: '2px', background: '#1a1d23', borderRadius: '1px' }}>
                        <div style={{ height: '2px', background: '#3b82f6', borderRadius: '1px', width: `${(count / result.nodes.length) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6b7280', width: '20px', textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Import mode */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '8px', color: '#2e3340', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '6px' }}>Modo de importação</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['replace', 'merge'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setImportMode(mode)}
                      style={{
                        padding: '5px 12px', borderRadius: '4px',
                        background: importMode === mode ? '#1e2128' : 'transparent',
                        border: `1px solid ${importMode === mode ? '#252830' : '#1e2128'}`,
                        color: importMode === mode ? '#8b95a5' : '#3d4455',
                        fontSize: '10px', fontFamily: 'monospace', cursor: 'pointer',
                      }}
                    >
                      {mode === 'replace' ? 'Substituir canvas' : 'Mesclar com canvas atual'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setPhase('idle'); setResult(null); }}
                  style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid #1e2128', borderRadius: '4px', color: '#3d4455', fontSize: '11px', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  Voltar
                </button>
                <button
                  onClick={() => applyResult(result)}
                  style={{ flex: 2, padding: '9px', background: '#1e2128', border: '1px solid #252830', borderRadius: '4px', color: '#8b95a5', fontSize: '11px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600 }}
                >
                  Importar para o Canvas
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
