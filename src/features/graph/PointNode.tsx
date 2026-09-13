import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GraphNode } from '../../core/types/graph';

export interface PointNodeData {
  node: GraphNode;
  highlighted?: boolean;
}

export const PointNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as PointNodeData;
  const node = nodeData.node;
  const isHighlighted = nodeData.highlighted || selected;

  const isTs = node.language === 'typescript' || node.language === 'tsx';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 1, height: 1 }}
      />

      {/* Point Node Glowing Dot */}
      <div
        style={{
          width: isHighlighted ? 18 : 12,
          height: isHighlighted ? 18 : 12,
          borderRadius: '50%',
          background: isHighlighted
            ? 'radial-gradient(circle, #ffffff 0%, #38bdf8 60%, #0284c7 100%)'
            : isTs
            ? 'radial-gradient(circle, #f8fafc 0%, #38bdf8 80%)'
            : 'radial-gradient(circle, #f8fafc 0%, #fbbf24 80%)',
          boxShadow: isHighlighted
            ? '0 0 18px 4px rgba(56, 189, 248, 0.95), 0 0 35px rgba(56, 189, 248, 0.5)'
            : '0 0 10px 2px rgba(56, 189, 248, 0.6)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '2px solid rgba(255, 255, 255, 0.9)',
        }}
      />

      {/* Point Node Label */}
      <div
        style={{
          marginTop: '6px',
          fontSize: '0.72rem',
          fontWeight: isHighlighted ? 700 : 500,
          color: isHighlighted ? '#38bdf8' : 'rgba(255, 255, 255, 0.92)',
          textShadow: '0 2px 6px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.8)',
          whiteSpace: 'nowrap',
          maxWidth: '140px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
          pointerEvents: 'none',
          letterSpacing: '-0.01em',
          background: 'rgba(7, 9, 14, 0.4)',
          padding: '2px 6px',
          borderRadius: '4px',
          backdropFilter: 'blur(4px)',
        }}
        title={node.path}
      >
        {node.name}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 1, height: 1 }}
      />
    </div>
  );
});

PointNode.displayName = 'PointNode';
