# CodeVerse — Visual Codebase Architecture & Dependency Intelligence

> Understand any software repository visually in seconds.

CodeVerse transforms complex software codebases into interactive visual architecture and dependency maps.

---

## Current Status: **Phase 1 Implemented**

CodeVerse has completed **Phase 1** implementation. It provides deterministic JavaScript and TypeScript import analysis and interactive 2D graph visualizers for public GitHub repositories.

---

## ⚡ Phase 1 Features Available Now

- **GitHub Repository Analysis**: Enter any public GitHub URL (e.g. `https://github.com/facebook/react` or `pmndrs/zustand`).
- **Deterministic AST Parsing**: Parses `.js`, `.jsx`, `.ts`, and `.tsx` source code in-browser using `@babel/parser`.
- **Import Relationship Extraction**: Identifies static imports, exports, require statements, and dynamic imports with relative path resolution (`./`, `../`, `@/`).
- **Normalized Graph Representation**: Framework-independent core model storing node metrics (in-degree, out-degree, depth, entrypoints).
- **Interactive 2D Graph Canvas**: Rendered with `@xyflow/react` and Dagre auto-layout. Supports pan, zoom, fit view, and glowing node highlights.
- **Side Inspector Panel**: Displays selected node metrics, byte size, line count, direct imports, and dependent files with 1-click graph navigation.
- **Live Search & Filter Toolbar**: Real-time graph node searching and file filtering.
- **Offline Sample Presets**: Includes instant pre-analyzed demo models (`Zustand`, `Redux Toolkit`, `CodeVerse Engine`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript 5.7, Vite 6
- **AST Parser**: `@babel/parser`
- **Graph Renderer**: `@xyflow/react` (React Flow v12)
- **Graph Layout**: Dagre
- **Styling**: Vanilla CSS with CSS custom properties (Dark mode, glassmorphism, glowing nodes)

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18+` or `v22+`
- npm `v9+` or `v10+`

### Installation
```bash
# Clone or navigate to directory
cd CodeVerse

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔍 How to Analyze a Repository

1. Launch CodeVerse dev server (`npm run dev`).
2. Paste any public GitHub repository URL into the input field (e.g., `https://github.com/pmndrs/zustand`).
3. Click **Analyze Repository** (or select a quick-start demo card).
4. Watch the real-time progress checklist as files are fetched and parsed into ASTs.
5. Explore the generated 2D graph! Click nodes to inspect dependencies, search for files, or filter by file type.

---

## 📁 Project Structure

```text
CodeVerse/
├── src/
│   ├── app/
│   │   └── App.tsx                 # Main application state and layout shell
│   ├── core/
│   │   ├── types/
│   │   │   └── graph.ts            # Normalized graph core interfaces
│   │   └── graph/
│   │       ├── NormalizedGraphModel.ts  # Framework-independent data structure
│   │       └── RendererAdapter.ts       # Adapter interface for 2D/3D renderers
│   ├── services/
│   │   ├── github/
│   │   │   └── githubService.ts    # GitHub REST API client & URL validator
│   │   ├── analysis/
│   │   │   ├── astParser.ts        # Babel AST import extractor & path resolver
│   │   │   └── dependencyAnalyzer.ts # Analysis workflow & progress reporter
│   │   └── fixtures/
│   │       └── sampleRepos.ts      # Instant offline demo repository models
│   ├── features/
│   │   ├── repository/
│   │   │   └── UrlInput.tsx        # Landing input form & sample preset cards
│   │   ├── analysis/
│   │   │   └── ProgressModal.tsx   # Real-time analysis step monitor
│   │   ├── graph/
│   │   │   ├── GraphCanvas.tsx     # React Flow canvas with Dagre auto-layout
│   │   │   └── FileNode.tsx        # Custom node component
│   │   └── visualization/
│   │       ├── InspectorPanel.tsx  # Node metadata inspector & dependency lists
│   │       └── SearchBar.tsx       # Live search & node filter toolbar
│   └── index.css                   # Dark mode design system
├── phases/
│   ├── phase1.md                   # Complete Phase 1 technical learning documentation
│   ├── phase2.md ... phase8.md    # Future phase roadmap placeholders
├── PRODUCT_SPEC.md                 # Product specification
└── README.md                       # Main documentation
```

---

## 🗺️ Product Roadmap

- [x] **Phase 1 — Repository Understanding (Implemented)**: GitHub JS/TS AST parsing, normalized graph model, interactive 2D visualizer.
- [ ] **Phase 2 — Advanced Graph Exploration**: Directory node grouping, depth traversal, radial layouts.
- [ ] **Phase 3 — 3D Codebase Visualization**: Three.js / React Three Fiber spatial rendering.
- [ ] **Phase 4 — Local Developer CLI**: `npx codeverse` offline local analyzer.
- [ ] **Phase 5 — Code Intelligence**: Architecture pattern detection & impact analysis.
- [ ] **Phase 6 — AI Codebase Assistant**: "Ask your codebase" natural language assistant.
- [ ] **Phase 7 — Git History & Evolution**: Commit timeline architectural drift visualization.
- [ ] **Phase 8 — Spatial Computing**: WebXR & MediaPipe hand gesture controls.

---

## 📚 Technical Documentation

For an in-depth breakdown of the Phase 1 architecture, AST parsing logic, data models, performance decisions, and key learnings, see:

👉 [phases/phase1.md](file:///Users/vandit/Documents/TechVersion/CodeVerse/phases/phase1.md)
# CodeVerse
