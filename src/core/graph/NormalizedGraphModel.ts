import { GraphNode, GraphEdge, NormalizedGraphData, AnalysisStats, RepositoryRef } from '../types/graph';

export class NormalizedGraphModel {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private repoRef: RepositoryRef;
  private analysisStats: AnalysisStats;

  constructor(repoRef: RepositoryRef, stats?: Partial<AnalysisStats>) {
    this.repoRef = repoRef;
    this.analysisStats = {
      totalFilesDiscovered: 0,
      totalFilesAnalyzed: 0,
      totalFilesSkipped: 0,
      totalImportsFound: 0,
      totalEdgesCreated: 0,
      durationMs: 0,
      languagesCount: {
        typescript: 0,
        javascript: 0,
        tsx: 0,
        jsx: 0,
        json: 0,
        unknown: 0,
      },
      skippedFiles: [],
      ...stats,
    };
  }

  public addNode(node: GraphNode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, { ...node });
    } else {
      const existing = this.nodes.get(node.id)!;
      this.nodes.set(node.id, { ...existing, ...node });
    }
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public addEdge(edge: GraphEdge): void {
    if (edge.source === edge.target) return; // Ignore self-imports
    if (!this.edges.has(edge.id)) {
      this.edges.set(edge.id, edge);

      // Update in-degree & out-degree metrics
      const sourceNode = this.nodes.get(edge.source);
      if (sourceNode) {
        sourceNode.importsCount = (sourceNode.importsCount || 0) + 1;
      }

      const targetNode = this.nodes.get(edge.target);
      if (targetNode) {
        targetNode.importedByCount = (targetNode.importedByCount || 0) + 1;
      }
    }
  }

  public getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  public getImportsForNode(nodeId: string): { edge: GraphEdge; node: GraphNode }[] {
    const results: { edge: GraphEdge; node: GraphNode }[] = [];
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId) {
        const targetNode = this.nodes.get(edge.target);
        if (targetNode) {
          results.push({ edge, node: targetNode });
        }
      }
    }
    return results;
  }

  public getImportedByForNode(nodeId: string): { edge: GraphEdge; node: GraphNode }[] {
    const results: { edge: GraphEdge; node: GraphNode }[] = [];
    for (const edge of this.edges.values()) {
      if (edge.target === nodeId) {
        const sourceNode = this.nodes.get(edge.source);
        if (sourceNode) {
          results.push({ edge, node: sourceNode });
        }
      }
    }
    return results;
  }

  public searchNodes(query: string): GraphNode[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllNodes();
    return this.getAllNodes().filter(
      (node) =>
        node.name.toLowerCase().includes(q) ||
        node.path.toLowerCase().includes(q)
    );
  }

  public filterNodesByType(type: 'all' | 'file' | 'directory' | 'module'): GraphNode[] {
    if (type === 'all') return this.getAllNodes();
    return this.getAllNodes().filter((node) => node.type === type);
  }

  public getStats(): AnalysisStats {
    return { ...this.analysisStats };
  }

  public setStats(stats: Partial<AnalysisStats>): void {
    this.analysisStats = { ...this.analysisStats, ...stats };
  }

  public getRepoRef(): RepositoryRef {
    return { ...this.repoRef };
  }

  public exportNormalizedData(): NormalizedGraphData {
    return {
      nodes: new Map(this.nodes),
      edges: new Map(this.edges),
      stats: this.getStats(),
      repo: this.getRepoRef(),
    };
  }
}
