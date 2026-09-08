import { NormalizedGraphModel } from './NormalizedGraphModel';
import { GraphNode, GraphEdge } from '../types/graph';

export interface RenderableNode {
  id: string;
  label: string;
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface RenderableEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface RenderableGraph {
  nodes: RenderableNode[];
  edges: RenderableEdge[];
}

export interface RendererAdapter {
  adapt(model: NormalizedGraphModel): RenderableGraph;
}
