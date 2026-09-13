import React from 'react';
import { X, FileCode, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { GraphNode } from '../../core/types/graph';
import { NormalizedGraphModel } from '../../core/graph/NormalizedGraphModel';

interface InspectorPanelProps {
  selectedNode: GraphNode | null;
  graphModel: NormalizedGraphModel | null;
  onSelectNode: (node: GraphNode | null) => void;
  onClose: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNode,
  graphModel,
  onSelectNode,
  onClose,
}) => {
  if (!selectedNode || !graphModel) return null;

  const importsList = graphModel.getImportsForNode(selectedNode.id);
  const importedByList = graphModel.getImportedByForNode(selectedNode.id);
  const repoRef = graphModel.getRepoRef();

  const githubFileUrl = repoRef.url
    ? `${repoRef.url}/blob/${repoRef.branch || 'main'}/${selectedNode.path}`
    : null;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '4.25rem',
        right: '1rem',
        bottom: '1rem',
        width: '380px',
        maxHeight: 'calc(100% - 5.25rem)',
        overflowY: 'auto',
        zIndex: 45,
        padding: '1.25rem',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          <FileCode size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' }}>
              {selectedNode.name}
            </h3>
            <span className={`badge badge-${selectedNode.language}`} style={{ marginTop: '0.2rem' }}>
              {selectedNode.language}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* File Path */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.6rem 0.75rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          wordBreak: 'break-all',
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {selectedNode.path}
      </div>

      {/* GitHub Link */}
      {githubFileUrl && !repoRef.isSample && (
        <a
          href={githubFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: '#38bdf8',
            textDecoration: 'none',
            marginBottom: '1.25rem',
            fontWeight: 500,
          }}
        >
          View source on GitHub <ExternalLink size={14} />
        </a>
      )}

      {/* Metrics Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{selectedNode.importsCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <ArrowUpRight size={12} /> Direct Imports
          </div>
        </div>

        <div
          style={{
            background: 'rgba(129, 140, 248, 0.08)',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{selectedNode.importedByCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <ArrowDownRight size={12} /> Imported By
          </div>
        </div>
      </div>

      {/* Imports List (Outgoing Dependencies) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '0.5rem',
          }}
        >
          Imports ({importsList.length})
        </h4>

        {importsList.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No internal imports</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {importsList.map(({ edge, node }) => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{node.name}</span>
                {edge.importedSymbols && edge.importedSymbols.length > 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {edge.importedSymbols.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Imported By List (Incoming Dependents) */}
      <div>
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '0.5rem',
          }}
        >
          Imported By ({importedByList.length})
        </h4>

        {importedByList.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No internal dependents</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {importedByList.map(({ node }) => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{node.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{node.path.split('/')[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
