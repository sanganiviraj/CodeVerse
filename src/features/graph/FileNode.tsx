import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileCode, Layers, Star } from 'lucide-react';
import { GraphNode } from '../../core/types/graph';

export const FileNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const node = data.node as GraphNode;
  const isSelected = selected || data.highlighted;

  const getLangBadgeClass = (lang: string) => {
    switch (lang) {
      case 'typescript': return 'badge-ts';
      case 'tsx': return 'badge-tsx';
      case 'javascript': return 'badge-js';
      case 'jsx': return 'badge-jsx';
      default: return 'badge-ts';
    }
  };

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        border: isSelected
          ? '2px solid #38bdf8'
          : node.isEntrypoint
          ? '1.5px solid rgba(251, 191, 36, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: isSelected
          ? '0 0 20px rgba(56, 189, 248, 0.4)'
          : node.isEntrypoint
          ? '0 0 12px rgba(251, 191, 36, 0.2)'
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        minWidth: '180px',
        maxWidth: '260px',
        color: '#f8fafc',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#38bdf8', width: 8, height: 8 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
          <FileCode size={16} color={node.isEntrypoint ? '#fbbf24' : '#38bdf8'} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.name}
          </span>
        </div>
        {node.isEntrypoint && <Star size={14} color="#fbbf24" fill="#fbbf24" style={{ flexShrink: 0 }} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span className={`badge ${getLangBadgeClass(node.language)}`}>{node.language}</span>
        <div style={{ display: 'flex', gap: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          <span title="Imported by (in-degree)">↓{node.importedByCount}</span>
          <span title="Imports (out-degree)">↑{node.importsCount}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ background: '#818cf8', width: 8, height: 8 }} />
    </div>
  );
});

FileNode.displayName = 'FileNode';
