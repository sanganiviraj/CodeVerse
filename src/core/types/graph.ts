/**
 * CodeVerse Graph Core Types
 * Framework-independent normalized representation of software repository dependencies.
 */

export type NodeType = 'file' | 'directory' | 'module';
export type SupportedLanguage = 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json' | 'unknown';

export interface GraphNode {
  id: string;             // Unique identifier, e.g. "src/services/AuthService.ts"
  name: string;           // Display name, e.g. "AuthService.ts"
  path: string;           // Normalized repo-relative path, e.g. "src/services/AuthService.ts"
  type: NodeType;         // 'file' | 'directory' | 'module'
  language: SupportedLanguage;
  sizeBytes?: number;
  
  // Graph Metrics
  importsCount: number;      // Out-degree: number of files this node imports
  importedByCount: number;   // In-degree: number of files that import this node
  depth?: number;            // Directory nesting depth
  isEntrypoint?: boolean;    // Identified entry points (index.ts, App.tsx, main.ts, etc.)
  
  // Code info
  rawImports?: string[];     // Raw import target strings before resolution
}

export interface GraphEdge {
  id: string;             // Edge ID "source->target"
  source: string;         // Node ID of importing file
  target: string;         // Node ID of imported file/module
  type: 'imports' | 'contains';
  importedSymbols?: string[]; // e.g. ['UserService', 'validateEmail']
  isDynamic?: boolean;    // Dynamic import() vs static import statement
}

export interface NormalizedGraphData {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  stats: AnalysisStats;
  repo: RepositoryRef;
}

export interface AnalysisStats {
  totalFilesDiscovered: number;
  totalFilesAnalyzed: number;
  totalFilesSkipped: number;
  totalImportsFound: number;
  totalEdgesCreated: number;
  durationMs: number;
  languagesCount: Record<SupportedLanguage, number>;
  skippedFiles: Array<{ path: string; reason: string }>;
}

export interface RepositoryRef {
  owner: string;
  repo: string;
  branch: string;
  url: string;
  isSample?: boolean;
}

export interface AnalysisProgress {
  step: 'validating' | 'fetching_tree' | 'fetching_sources' | 'parsing_ast' | 'building_graph' | 'layout' | 'complete' | 'error';
  message: string;
  currentCount?: number;
  totalCount?: number;
  percentage: number;
}
