import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { NormalizedGraphModel } from '../../core/graph/NormalizedGraphModel';
import { GraphNode } from '../../core/types/graph';
import { FileNode } from './FileNode';
import { PointNode } from './PointNode';
import { ViewportTransform } from '../interaction/interactionController';

interface GraphCanvasProps {
  graphModel: NormalizedGraphModel;
  selectedNodeId?: string | null;
  searchQuery?: string;
  filterType?: 'all' | 'file' | 'directory' | 'module';
  mode?: 'normal' | 'camera';
  externalViewport?: ViewportTransform | null;
  onSelectNode: (node: GraphNode | null) => void;
  onInitInstance?: (instance: ReactFlowInstance) => void;
}

const nodeTypes = {
  fileNode: FileNode,
  pointNode: PointNode,
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphModel,
  selectedNodeId,
  searchQuery = '',
  filterType = 'all',
  mode = 'normal',
  externalViewport = null,
  onSelectNode,
  onInitInstance,
}) => {
  const isCameraMode = mode === 'camera';
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);

  // Convert NormalizedGraphModel to React Flow nodes and edges using Dagre Layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const rawNodes = graphModel.getAllNodes();
    const rawEdges = graphModel.getAllEdges();

    const filteredNodes = rawNodes.filter((n) => {
      if (filterType !== 'all' && n.type !== filterType) return false;
      return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    // Setup Dagre graph layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: isCameraMode ? 40 : 50, ranksep: isCameraMode ? 80 : 100 });

    const nodeWidth = isCameraMode ? 120 : 220;
    const nodeHeight = isCameraMode ? 50 : 75;

    filteredNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    const validEdges = rawEdges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );

    validEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // Map to React Flow Nodes
    const flowNodes: Node[] = filteredNodes.map((node) => {
      const nodeWithPos = dagreGraph.node(node.id);
      const isSearchMatch =
        searchQuery.trim().length > 0 &&
        (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.path.toLowerCase().includes(searchQuery.toLowerCase()));

      return {
        id: node.id,
        type: isCameraMode ? 'pointNode' : 'fileNode',
        position: {
          x: (nodeWithPos?.x || 0) - nodeWidth / 2,
          y: (nodeWithPos?.y || 0) - nodeHeight / 2,
        },
        data: {
          node,
          highlighted: isSearchMatch || node.id === selectedNodeId,
        },
        selected: node.id === selectedNodeId,
      };
    });

    // Map to React Flow Edges
    const flowEdges: Edge[] = validEdges.map((edge) => {
      const isConnectedToSelected =
        selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: !!edge.isDynamic || !!isConnectedToSelected,
        style: {
          stroke: isConnectedToSelected
            ? '#38bdf8'
            : isCameraMode
            ? 'rgba(255, 255, 255, 0.45)'
            : 'rgba(148, 163, 184, 0.35)',
          strokeWidth: isConnectedToSelected ? 2.5 : isCameraMode ? 1.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isConnectedToSelected
            ? '#38bdf8'
            : isCameraMode
            ? 'rgba(255, 255, 255, 0.6)'
            : 'rgba(148, 163, 184, 0.5)',
          width: 14,
          height: 14,
        },
      };
    });

    return { initialNodes: flowNodes, initialEdges: flowEdges };
  }, [graphModel, selectedNodeId, searchQuery, filterType, isCameraMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Sync external hand gesture viewport adjustments
  useEffect(() => {
    if (externalViewport && flowInstanceRef.current) {
      flowInstanceRef.current.setViewport(externalViewport);
    }
  }, [externalViewport]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      flowInstanceRef.current = instance;
      onInitInstance?.(instance);
    },
    [onInitInstance]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const matchedNode = graphModel.getNode(node.id);
      onSelectNode(matchedNode || null);
    },
    [graphModel, onSelectNode]
  );

  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: isCameraMode ? 'transparent' : '#07090e',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onInit={handleInit}
        fitView
        fitViewOptions={{ padding: isCameraMode ? 0.35 : 0.2 }}
        minZoom={0.1}
        maxZoom={2.5}
        style={{ background: 'transparent' }}
      >
        {!isCameraMode && (
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255, 255, 255, 0.07)" />
        )}
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          nodeColor={() => '#38bdf8'}
          maskColor="rgba(7, 9, 14, 0.7)"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
          }}
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
};
