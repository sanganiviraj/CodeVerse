# CodeVerse — Phase 1 Technical Specification & Architecture Guide

## 1. Phase 1 Goal
The primary objective of Phase 1 is to construct a **working, runnable, demo-ready vertical slice** of CodeVerse that proves the core product concept:
> Given a public GitHub repository URL, CodeVerse analyzes its JavaScript and TypeScript import relationships, constructs a normalized framework-independent dependency graph model, and renders an interactive 2D graph visualizer.

---

## 2. What Was Implemented
- **GitHub Repository URL Input & Validation**: Supports standard URLs (`https://github.com/owner/repo`), branch references, and shorthand (`owner/repo`). Includes instant quick-start demo presets (`Zustand`, `Redux Toolkit`, `CodeVerse Engine`).
- **GitHub File Tree Ingestion & Content Fetching**: Recursively fetches repository structure via GitHub REST API and retrieves raw file contents with caching and error handling.
- **Deterministic AST Parser**: Uses `@babel/parser` to parse JavaScript (`.js`, `.jsx`) and TypeScript (`.ts`, `.tsx`) source files without relying on external LLM services or native server binaries.
- **Import Resolution Engine**: Extracts static `import`, `export ... from`, `require()`, and dynamic `import()` statements, resolving relative paths (`./`, `../`) and path aliases (`@/`).
- **Normalized Graph Model**: A framework-agnostic core data structure (`NormalizedGraphModel`) maintaining nodes, edges, in-degree/out-degree metrics, entrypoints, and statistics.
- **Interactive 2D Graph Visualizer**: Built with `@xyflow/react` (React Flow v12) and Dagre hierarchical layout. Supports pan, zoom, fit view, node selection glow, and edge arrows.
- **Node Inspector & Metadata Panel**: Clicking any node opens a side inspector showing file details, line/byte stats, metrics, direct imports, and incoming dependents with clickable graph navigation.
- **Live Search & Filter Toolbar**: Real-time searching for nodes by filename/path and filter toggling.
- **Real-Time Step-by-Step Progress Monitor**: Visual checklist tracking repository validation, tree discovery, source fetching, AST parsing, and graph construction.

---

## 3. Technology Stack
- **React 18**: UI framework for responsive declarative rendering.
- **TypeScript 5.7**: Strict type safety across graph data models, AST structures, and services.
- **Vite 6**: Next-generation frontend build tool providing fast HMR and optimized bundling.
- **@babel/parser**: Browser-compatible, deterministic AST parser supporting TS, JSX, TSX, modern ES features.
- **@xyflow/react (React Flow)**: Highly interactive 2D graph renderer with custom node components.
- **Dagre**: Directed graph auto-layout engine for hierarchical node positioning.
- **Lucide React**: Clean, modern developer icon library.

---

## 4. Project Structure
```text
CodeVerse/
├── src/
│   ├── app/
│   │   └── App.tsx                 # Main application shell and state orchestrator
│   ├── core/
│   │   ├── types/
│   │   │   └── graph.ts            # Normalized graph interface definitions
│   │   └── graph/
│   │       ├── NormalizedGraphModel.ts  # Framework-independent graph data structure
│   │       └── RendererAdapter.ts       # Adapter interface decoupling data from renderers
│   ├── services/
│   │   ├── github/
│   │   │   └── githubService.ts    # GitHub REST API client & URL parser
│   │   ├── analysis/
│   │   │   ├── astParser.ts        # Babel AST parsing & path resolution logic
│   │   │   └── dependencyAnalyzer.ts # Analysis workflow coordinator & progress emitter
│   │   └── fixtures/
│   │       └── sampleRepos.ts      # Offline sample demo repository graphs
│   ├── features/
│   │   ├── repository/
│   │   │   └── UrlInput.tsx        # Landing input form & sample repository buttons
│   │   ├── analysis/
│   │   │   └── ProgressModal.tsx   # Real-time progress monitor modal
│   │   ├── graph/
│   │   │   ├── GraphCanvas.tsx     # React Flow canvas wrapper with Dagre layout
│   │   │   └── FileNode.tsx        # Custom node component with language badges
│   │   └── visualization/
│   │       ├── InspectorPanel.tsx  # Selected node details & dependency lists
│   │       └── SearchBar.tsx       # Search query & filter toolbar
│   ├── index.css                   # Dark mode design system & typography
│   └── main.tsx                    # React application entrypoint
├── phases/
│   ├── phase1.md                   # This technical learning specification
│   ├── phase2.md ... phase8.md    # Future phase roadmap placeholders
├── PRODUCT_SPEC.md                 # Product specification
├── README.md                       # Repository overview and setup guide
└── package.json
```

---

## 5. Data Flow
```text
GitHub URL Input
       ↓
GitHubService.parseUrl()
       ↓
GitHubService.fetchRepositoryTree()
       ↓
Filter supported JS/TS source files (.ts, .tsx, .js, .jsx)
       ↓
GitHubService.fetchFileContent() (batched concurrent requests)
       ↓
ASTParser.parseSource() (@babel/parser -> static & dynamic imports)
       ↓
ASTParser.resolveImportPath() (relative & aliased path resolution)
       ↓
NormalizedGraphModel.addNode() & addEdge() (compute in/out degrees)
       ↓
GraphCanvas (Dagre layout -> React Flow 2D Node/Edge rendering)
       ↓
User interaction (Inspect Node / Search / Filter / Pan & Zoom)
```

---

## 6. Important Code Reference

### `src/core/graph/NormalizedGraphModel.ts`
- **Responsibility**: Manages framework-independent graph state.
- **Receives**: `RepositoryRef` and optional analysis statistics.
- **Returns**: `GraphNode`, `GraphEdge`, dependency queries, and exported normalized data.

### `src/services/analysis/astParser.ts`
- **Responsibility**: Parses raw code strings into ASTs using `@babel/parser`, extracts import specifiers, and resolves target file paths.
- **Receives**: `filePath` and `code`.
- **Returns**: `ParseResult` with list of imports, imported symbols, and line numbers.

### `src/services/analysis/dependencyAnalyzer.ts`
- **Responsibility**: Coordinates end-to-end repository fetching, batch AST parsing, path resolution, and graph model population with real-time progress callbacks.
- **Receives**: GitHub URL string and progress callback function.
- **Returns**: `Promise<NormalizedGraphModel>`.

---

## 7. Graph Model
The graph model is normalized and completely decoupled from UI rendering:
```typescript
export interface GraphNode {
  id: string;             // Unique file path, e.g. "src/services/AuthService.ts"
  name: string;           // Display name, e.g. "AuthService.ts"
  path: string;           // Relative file path
  type: 'file' | 'directory' | 'module';
  language: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json' | 'unknown';
  importsCount: number;      // Out-degree
  importedByCount: number;   // In-degree
  isEntrypoint?: boolean;    // Main index / app entrypoint flag
}

export interface GraphEdge {
  id: string;             // Edge ID "source->target"
  source: string;         // Importing file path
  target: string;         // Imported file path
  type: 'imports' | 'contains';
  importedSymbols?: string[];
  isDynamic?: boolean;
}
```

---

## 8. Repository Analysis Logic
1. Fetch recursive tree of files from GitHub REST API.
2. Filter for supported extensions (`.ts`, `.tsx`, `.js`, `.jsx`).
3. Ignore `node_modules`, `dist`, `.d.ts`, and minified files.
4. Fetch file contents concurrently in batches of 10.
5. Extract imports per file and map relative paths to normalized paths in `availablePathsSet`.

---

## 9. Parsing Logic
Uses `@babel/parser` with `jsx`, `typescript`, `dynamicImport`, `exportDefaultFrom`, `classProperties`, `optionalChaining`, and `nullishCoalescingOperator` plugins.

Supported import syntax variations:
- `import defaultItem, { namedItem } from './module'`
- `import * as namespaceItem from './module'`
- `export { item } from './module'`
- `export * from './module'`
- `const module = require('./module')`
- `import('./module')`

---

## 10. GitHub Integration
Uses GitHub REST API (`https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`) and raw content endpoint (`https://raw.githubusercontent.com/...`). Provides automatic fallback from `main` to `master` branches and actionable error messages for non-existent repositories or rate limit limits.

---

## 11. Visualization Logic
The `GraphCanvas` component converts `NormalizedGraphModel` nodes into layout-calculated positions using `Dagre`:
- Nodes positioned left-to-right (`LR`) according to dependency depth.
- Custom `FileNode` components highlight file extension badges, entrypoint stars, and in/out degrees.
- Active edges display animated directional arrows.

---

## 12. State Management
Application state is managed in `src/app/App.tsx` using standard React hooks (`useState`). As complexity grows in Phase 2, state will migrate to a dedicated store (e.g. Zustand).

---

## 13. Error Handling
- **Invalid URL**: Immediate validation before network call.
- **404 Repo Not Found**: Friendly alert explaining repository unavailability or privacy constraint.
- **Parsing Errors**: Malformed or unparseable files are skipped and logged to `skippedFiles` list without breaking graph generation for valid files.

---

## 14. Performance Considerations
- **Batch Processing**: Source code fetches and AST parses run concurrently in batches of 10.
- **Analysis Ceiling**: Phase 1 limits live browser live fetches to the first 100 source files to prevent hitting browser network socket limits.
- **Pre-Calculated Sample Presets**: Includes instant offline demo models (`Zustand`, `Redux Toolkit`, `CodeVerse Engine`).

---

## 15. Known Limitations
- Only public GitHub repositories are supported in Phase 1 (no authentication token required).
- Import analysis focuses on JavaScript, TypeScript, JSX, and TSX.
- CSS/SCSS/HTML imports and asset dependencies are ignored in Phase 1.
- No 3D, WebXR, AR, or AI features in Phase 1.

---

## 16. How to Run
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

---

## 17. How to Build
```bash
# Type check and build production bundle
npm run build
```

---

## 18. How to Test
```bash
# Type check without emitting files
npm run lint
```

---

## 19. What I Learned from Phase 1
- **Decoupling Data from Presentation**: Isolating `NormalizedGraphModel` from React Flow simplifies testing and guarantees smooth transition to 3D renderers in Phase 3.
- **In-Browser AST Parsing**: `@babel/parser` enables robust AST parsing directly inside the browser environment without server-side dependencies.
- **Defensive Error Tolerances**: Large codebases inevitably contain unparseable files; skipping invalid files gracefully preserves user experience.

---

## 20. Why We Are NOT Building 3D Yet
Phase 1 focuses on verifying the foundational architecture: repository ingestion, AST parsing, path resolution, and graph data normalization. Building 3D renderers before establishing a rock-solid, deterministic data pipeline leads to brittle visual artifacts. The 2D visualizer validates that the underlying dependency graph is accurate before introducing Spatial / 3D computing in Phase 3.
