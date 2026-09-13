# CodeVerse — Visual Codebase Architecture & Dependency Intelligence

> Understand any software repository visually in seconds.

CodeVerse transforms complex software codebases into interactive visual architecture and dependency maps.

---

## Current Status: **Phase 2 Implemented**

CodeVerse has completed **Phase 1** and **Phase 2** implementations. It provides deterministic JavaScript and TypeScript import analysis, interactive 2D graph visualizers, live webcam spatial overlay mode, and WebAssembly-powered hand gesture controls.

---

## ⚡ Key Features

### Phase 1 — Repository Understanding & 2D Graph Visualizer
- **GitHub Repository Ingestion**: Enter any public GitHub URL (e.g. `https://github.com/pmndrs/zustand` or `reduxjs/redux-toolkit`).
- **Deterministic In-Browser AST Parsing**: Parses `.js`, `.jsx`, `.ts`, and `.tsx` source code using `@babel/parser`.
- **Import Relationship Resolution**: Identifies static imports, exports, require statements, and dynamic imports with relative path resolution (`./`, `../`, `@/`).
- **Normalized Graph Representation**: Framework-independent core model storing node metrics (in-degree, out-degree, depth, entrypoints).
- **Interactive 2D Graph Canvas**: Rendered with `@xyflow/react` and Dagre auto-layout.
- **Side Inspector Panel**: Displays selected node metrics, byte size, line count, direct imports, and dependent files with 1-click graph navigation.
- **Live Search & Filter Toolbar**: Real-time graph node searching and file filtering.
- **Offline Sample Presets**: Includes instant pre-analyzed demo models (`Zustand`, `Redux Toolkit`, `CodeVerse Engine`).

### Phase 2 — Camera Mode & Hand Interaction
- **Spatial Mode Switcher**: Header toggle between `Normal Mode` (2D Canvas) and `Camera Mode` (Spatial Overlay).
- **Live Webcam Background**: Renders live video feed as background layer via HTML5 `getUserMedia()`.
- **Left Contrast Gradient Overlay**: Multi-stop CSS black gradient guarantees high legibility for graph point nodes over bright webcam backgrounds.
- **Transparent Point-Style Graph Overlay**: Custom `PointNode` visualizer with glowing radial dots (`box-shadow: 0 0 12px #38bdf8`), clean typography, and thin glowing connection lines.
- **Wasm-Based Hand Tracking**: Powered by Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision` `HandLandmarker`), tracking 21 3D hand landmarks frame-by-frame locally.
- **Pinch & Pan Gesture Controls**: Pinch thumb + index finger to grab the graph, move hand to translate graph viewport, and release pinch to drop in place.
- **Graceful Camera Fallbacks**: Non-blocking permission handling that falls back to mouse/trackpad controls if the camera is denied or unavailable.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript 5.7, Vite 6
- **AST Parser**: `@babel/parser`
- **Graph Renderer**: `@xyflow/react` (React Flow v12) & Dagre Layout
- **Computer Vision & Hand Tracking**: `@mediapipe/tasks-vision` (`HandLandmarker`)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with CSS custom properties (Dark mode, glassmorphism, glowing nodes, spatial camera gradients)

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

## 🔍 How to Demo Phase 2 (Camera Mode & Hand Gestures)

1. Launch CodeVerse dev server (`npm run dev`).
2. Click sample preset `Zustand` or enter a GitHub repository URL.
3. Click **Camera Mode** in the top header bar.
4. Allow browser camera permission when prompted.
5. Place your hand in front of your camera.
6. Bring thumb and index finger together (**Pinch**) to grab the graph.
7. Move your hand to pan the software dependency graph around your camera view.
8. Release your pinch to drop the graph in place.
9. Click **Normal Mode** to exit Camera Mode and immediately turn off the webcam.

---

## 📁 Project Structure

```text
CodeVerse/
├── src/
│   ├── app/
│   │   └── App.tsx                 # Main application shell, state & mode orchestrator
│   ├── core/
│   │   ├── types/
│   │   │   └── graph.ts            # Normalized graph core interfaces
│   │   └── graph/
│   │       └── NormalizedGraphModel.ts  # Framework-independent data structure
│   ├── services/
│   │   ├── github/
│   │   │   └── githubService.ts    # GitHub REST API client & URL validator
│   │   ├── analysis/
│   │   │   ├── astParser.ts        # Babel AST import extractor & path resolver
│   │   │   └── dependencyAnalyzer.ts # Analysis workflow & progress reporter
│   │   └── fixtures/
│   │       └── sampleRepos.ts      # Instant offline demo repository models
│   ├── features/
│   │   ├── camera/
│   │   │   ├── CameraView.tsx      # Live webcam stream & left contrast gradient
│   │   │   └── GestureGuideModal.tsx # Onboarding gesture guide modal
│   │   ├── gestures/
│   │   │   ├── handTracker.ts      # MediaPipe Wasm HandLandmarker service
│   │   │   ├── gestureDetector.ts  # Pinch gesture state machine & Lerp smoothing
│   │   │   └── gestureTypes.ts     # Gesture event interfaces
│   │   ├── interaction/
│   │   │   └── interactionController.ts # Viewport translation controller
│   │   ├── graph/
│   │   │   ├── GraphCanvas.tsx     # Mode-aware React Flow canvas wrapper
│   │   │   ├── FileNode.tsx        # Standard 2D file card node
│   │   │   └── PointNode.tsx       # Glowing point node for Camera Mode
│   │   └── visualization/
│   │       ├── InspectorPanel.tsx  # Node metadata inspector & dependency lists
│   │       └── SearchBar.tsx       # Live search & node filter toolbar
│   └── index.css                   # Dark mode design system & spatial gradients
├── phases/
│   ├── phase1.md                   # Phase 1 technical specification
│   ├── phase2.md                   # Phase 2 technical specification (Camera + Gestures)
│   ├── phase3.md ... phase8.md    # Future phase roadmap placeholders
│   ├── PRODUCT_SPEC.md                 # Product specification
└── README.md                       # Repository overview and setup guide
```

---

## 🗺️ Product Roadmap

- [x] **Phase 1 — Repository Ingestion & 2D Graph Visualizer**: GitHub JS/TS AST parsing, normalized graph model, interactive 2D visualizer.
- [x] **Phase 2 — Camera Mode & Hand Interaction**: Live webcam background overlay, left black contrast gradient, Wasm hand landmark tracking, pinch/grab gesture navigation.
- [ ] **Phase 3 — 3D Codebase Visualization**: Three.js / React Three Fiber spatial rendering.
- [ ] **Phase 4 — Local Developer CLI**: `npx codeverse` offline local analyzer.
- [ ] **Phase 5 — Code Intelligence**: Architecture pattern detection & impact analysis.
- [ ] **Phase 6 — AI Codebase Assistant**: "Ask your codebase" natural language assistant.
- [ ] **Phase 7 — Git History & Evolution**: Commit timeline architectural drift visualization.
- [ ] **Phase 8 — Spatial Computing / WebXR**: Immersive spatial AR/VR headset integration.

---

## 📚 Technical Specifications

- Phase 1 Details: 👉 [phases/phase1.md](file:///Users/vandit/Documents/TechVersion/CodeVerse/phases/phase1.md)
- Phase 2 Details: 👉 [phases/phase2.md](file:///Users/vandit/Documents/TechVersion/CodeVerse/phases/phase2.md)
