# CODEVERSE — MASTER PRODUCT & DEVELOPMENT SPECIFICATION

## 1. ROLE

You are the lead product architect, senior full-stack engineer, UI/UX engineer, developer-tool engineer, and technical project manager for this project.

Your job is to take the product concept below and turn it into a production-quality developer tool.

Do not blindly start coding.

First:

1. Understand the complete product vision.
2. Analyze technical feasibility.
3. Analyze the repository/workspace.
4. Identify the best architecture.
5. Identify risks and constraints.
6. Define the MVP.
7. Create an implementation plan.
8. Then start implementing the MVP incrementally.

Do not over-engineer the first version.

Prioritize:

* Developer experience
* Performance
* Simplicity
* Extensibility
* Clean architecture
* Minimal setup
* Privacy
* Large-repository scalability

---

# 2. PRODUCT NAME

Working name:

## CodeVerse

Possible future branding can be changed later.

---

# 3. PRODUCT VISION

CodeVerse is a developer tool that helps developers understand unfamiliar software repositories visually.

Modern repositories can contain:

* Hundreds or thousands of files
* Complex folder structures
* Components
* Services
* Hooks
* Utilities
* APIs
* Database models
* Dependencies
* Classes
* Functions
* Modules
* Microservices
* Complex relationships

A developer joining an unfamiliar project often spends significant time understanding:

* What the project does
* Where important functionality lives
* How files depend on each other
* How data flows through the application
* Where APIs are called
* Where database logic lives
* Which modules are highly connected
* What might break if a file/service changes
* How the architecture evolved

CodeVerse should transform this complexity into an interactive visual representation.

The long-term vision is:

> "Understand any codebase visually in seconds."

---

# 4. CORE PRODUCT IDEA

A developer should be able to provide a repository using one of these methods:

### Method 1 — GitHub URL

Example:

https://github.com/user/repository

The system analyzes the repository and creates a visual architecture map.

### Method 2 — Local repository

Developer runs:

```bash
npx codeverse
```

inside an existing project.

CodeVerse analyzes the current repository and opens the visualization in the browser.

### Method 3 — Future integrations

Potential future support:

* GitLab
* Bitbucket
* ZIP upload
* VS Code extension
* GitHub App
* CI/CD integration

Do NOT implement these initially unless required by the MVP.

---

# 5. PRIMARY PRODUCT EXPERIENCE

The basic experience should be:

```text
Repository
    ↓
Repository ingestion
    ↓
Code analysis
    ↓
AST / dependency analysis
    ↓
Normalized code graph
    ↓
Graph intelligence
    ↓
2D visualization
    ↓
3D visualization
    ↓
Optional hand-gesture interaction
```

The architecture must keep these layers separate.

The renderer should NOT directly depend on GitHub.

The graph engine should NOT care where the repository came from.

The analyzer should produce a normalized graph that can be consumed by multiple clients.

---

# 6. IMPORTANT PRODUCT PRINCIPLE

Do NOT build a "pretty 3D file graph."

The goal is not visualization for visualization's sake.

The goal is:

> Help developers understand software architecture and relationships.

The visualization is the interface to the underlying codebase intelligence.

---

# 7. MVP

The MVP should focus on JavaScript and TypeScript repositories.

Initial supported technologies:

* JavaScript
* TypeScript
* React
* Node.js

Do NOT attempt to support every programming language initially.

Future languages can be added through a pluggable analyzer architecture.

---

# 8. MVP FEATURES

## Feature 1 — Repository Input

Provide a simple interface:

```text
Understand Your Codebase

GitHub repository URL

[____________________________]

[ Analyze Repository ]
```

Also support local CLI usage:

```bash
npx codeverse
```

---

# 9. Repository Analysis

The system should analyze:

### File structure

Example:

```text
src/
├── components/
├── screens/
├── hooks/
├── services/
├── utils/
└── store/
```

### Imports

Example:

```typescript
import { AuthService } from "../services/AuthService";
```

Create:

```text
Login
  ↓
AuthService
```

### Exports

Track exported modules and symbols.

### Classes

Detect:

* Classes
* Inheritance
* Implementations

### Functions

Detect functions where practical.

### React components

Detect React components where practical.

### Hooks

Detect custom hooks.

### Services

Identify service/module patterns where possible.

### API usage

Identify obvious API/service boundaries.

### Database

Initially detect common patterns such as:

* Prisma
* Drizzle
* Sequelize
* TypeORM
* Mongoose
* SQL migration/schema files

Do not promise perfect database inference.

---

# 10. GRAPH DATA MODEL

Create an internal normalized graph model.

Example:

```typescript
type Node = {
  id: string;
  type:
    | "project"
    | "module"
    | "folder"
    | "file"
    | "class"
    | "function"
    | "component"
    | "service"
    | "database";

  name: string;
  path?: string;
  language?: string;
  metadata?: Record<string, unknown>;
};

type Edge = {
  id: string;
  source: string;
  target: string;

  type:
    | "contains"
    | "imports"
    | "exports"
    | "calls"
    | "extends"
    | "implements"
    | "uses"
    | "depends_on";
};
```

This is an initial model, not a rigid requirement.

Improve it if a better architecture is identified.

---

# 11. GRAPH HIERARCHY

The graph must support multiple abstraction levels.

Example:

```text
PROJECT
   ↓
MODULE
   ↓
FOLDER
   ↓
FILE
   ↓
SYMBOL
   ↓
FUNCTION
```

Do NOT render every possible node simultaneously.

The visualization should progressively reveal detail.

---

# 12. LARGE REPOSITORY STRATEGY

Large repositories are a critical concern.

Never assume that rendering thousands of nodes and tens of thousands of edges simultaneously is acceptable.

Implement concepts such as:

### Level of Detail

At high zoom:

```text
Project
```

Zoom in:

```text
Authentication
Users
Payments
Orders
```

Zoom further:

```text
Login.tsx
AuthService.ts
UserRepository.ts
```

Zoom further:

```text
login()
validateToken()
refreshToken()
```

### Lazy expansion

Do not load/render every child immediately.

Expand nodes when the user requests them.

### Filtering

Allow users to filter:

```text
Files
Components
Services
APIs
Database
Dependencies
```

### Search

Example:

```text
Search: AuthService
```

The graph should locate and highlight it.

---

# 13. VISUALIZATION

The product should provide both:

## 2D mode

Simple, fast, accessible.

## 3D mode

The primary differentiating experience.

The 3D environment should allow:

* Rotate
* Zoom
* Pan
* Select nodes
* Expand/collapse
* Search
* Filter
* Highlight relationships
* Focus on a node
* Reset camera
* Hide unrelated nodes

---

# 14. RECOMMENDED FRONTEND STACK

Preferred initial stack:

```text
React
TypeScript
Vite
Three.js
React Three Fiber
```

Potential supporting libraries:

```text
@react-three/fiber
@react-three/drei
```

For graph layout, evaluate suitable libraries such as:

```text
3d-force-graph
graphology
D3
Cytoscape
```

Do not automatically use every library.

Choose the smallest reliable set.

---

# 15. CODE ANALYSIS

Avoid sending the entire repository to an LLM just to understand imports/dependencies.

Prefer deterministic analysis first.

Potential technologies:

```text
TypeScript Compiler API
Tree-sitter
language-specific parsers
```

The analysis pipeline should be:

```text
Repository
    ↓
Parser
    ↓
AST
    ↓
Relationships
    ↓
Normalized graph
```

AI should be an enhancement layer, not the fundamental parser.

---

# 16. AI LAYER — FUTURE

Eventually CodeVerse should have:

## "Ask Your Codebase"

Examples:

```text
Where does authentication happen?

How does checkout work?

Where is the database connection?

What files depend on UserService?

Show me the login flow.

What happens when a user places an order?
```

The answer should not only be text.

The graph should visually highlight the relevant nodes and relationships.

Example:

```text
Login
 ↓
AuthController
 ↓
AuthService
 ↓
JWTService
 ↓
UserRepository
```

The AI layer should use repository metadata/graph information rather than blindly sending the entire repository to an LLM.

---

# 17. IMPACT ANALYSIS — IMPORTANT FUTURE FEATURE

When a developer selects a node such as:

```text
PaymentService
```

provide:

```text
[ Impact Analysis ]
```

Example:

```text
Potentially affected:

12 files
4 API endpoints
2 database models
3 test suites
```

Visualize the dependency chain.

This can become one of CodeVerse's most valuable features.

---

# 18. ARCHITECTURE DETECTION — FUTURE

Try to identify architectural patterns such as:

* Layered architecture
* Feature-based architecture
* MVC
* Clean architecture
* Microservices
* Repository/service patterns

Example:

```text
UI
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

Display:

```text
Architecture detected:
Feature-based + Layered

Confidence:
87%
```

Do not claim certainty when the detection is heuristic.

---

# 19. DATABASE VISUALIZATION — FUTURE

If database schemas can be identified, visualize relationships.

Example:

```text
Users
  │
  │ 1:N
  ↓
Orders
  │
  │ 1:N
  ↓
OrderItems
```

Database visualization should be a separate graph layer that can connect back to application code.

---

# 20. GIT HISTORY — FUTURE FEATURE

Eventually visualize architecture evolution over time.

Example:

```text
2023 → 2024 → 2025 → 2026
```

The developer can move through commits/time and see how architecture changed.

Potential features:

* Newly created modules
* Removed modules
* Increasing complexity
* Highly changed files
* Architecture evolution
* Hotspots

---

# 21. HAND GESTURE INTERACTION

This is a major differentiator but NOT the first thing to build.

Camera interaction should be optional.

Never force camera permission.

Default interaction:

```text
Mouse
Trackpad
Keyboard
```

Optional:

```text
Enable hand controls
```

Potential gestures:

```text
Open palm
    → pan

Hand movement
    → rotate

Pinch
    → select

Two fingers
    → zoom

Fist
    → freeze/interaction mode
```

Start with only the smallest reliable gesture set.

Potential technology:

```text
MediaPipe
```

The gesture system must be isolated from the graph renderer.

Architecture:

```text
Camera
  ↓
Hand landmarks
  ↓
Gesture recognition
  ↓
Normalized interaction events
  ↓
Graph controller
```

Example:

```typescript
{
  type: "ROTATE",
  deltaX: 0.4,
  deltaY: -0.1
}
```

The renderer should not care whether this came from:

* Mouse
* Touch
* Keyboard
* Hand
* Future VR controller

---

# 22. AR / WEBXR

True AR is a long-term feature.

Do NOT implement full AR in the initial MVP.

Eventually explore:

```text
WebXR
AR
VR
Spatial computing
```

Long-term vision:

The codebase graph exists in physical space.

The developer can walk around the architecture and manipulate it with hand gestures.

But first prove that the underlying visualization and developer value are useful.

---

# 23. UI / UX

The UI should feel like a modern developer tool.

Avoid:

* Excessive gradients
* Unnecessary animations
* Overly complicated dashboards
* Too many buttons
* Cluttered sidebars

Prioritize:

* Dark/light theme support
* Clear hierarchy
* High readability
* Developer-oriented UX
* Fast interactions
* Keyboard shortcuts
* Search
* Filters
* Minimal onboarding

Main screen concept:

```text
┌───────────────────────────────────────────────────────┐
│ CodeVerse     Search...                2D   3D   ⚙   │
├───────────────┬───────────────────────────┬───────────┤
│               │                           │           │
│ Repository    │                           │ Selected  │
│               │       3D GRAPH            │ Node      │
│ Structure     │                           │           │
│               │                           │ Details   │
│ Filters       │                           │           │
│               │                           │ Relations │
│               │                           │           │
└───────────────┴───────────────────────────┴───────────┘
```

---

# 24. NODE INTERACTION

When selecting a node:

```text
UserService
```

show:

```text
Name:
UserService

Type:
Service

Path:
src/services/UserService.ts

Dependencies:
8

Dependents:
17

Imported by:
...

Imports:
...

[ Show Impact ]
[ Open Source ]
[ Focus ]
```

---

# 25. VISUAL SEMANTICS

Nodes should communicate meaning.

Examples:

```text
Project
Module
Folder
File
Component
Service
Database
API
```

Use consistent shapes/icons/visual treatment.

Do not rely only on color because accessibility matters.

---

# 26. PERFORMANCE

Performance is a first-class requirement.

Requirements:

* Avoid blocking the main thread
* Use Web Workers where appropriate
* Incremental parsing
* Lazy graph expansion
* Graph aggregation
* Level-of-detail rendering
* Efficient edge rendering
* Caching
* Avoid unnecessary React re-renders
* Use GPU rendering where appropriate
* Do not recreate large graph objects unnecessarily

Measure performance rather than assuming it is fast.

---

# 27. CACHING

Repository analysis should be cacheable.

Potential strategy:

```text
Repository
+
Commit SHA
+
File hash
```

If a file has not changed:

```text
Do not analyze again.
```

This becomes important for large repositories.

---

# 28. PRIVACY

Source code can be highly sensitive.

Design the architecture so that local analysis is possible.

The application should avoid sending source code externally unless explicitly required.

For future AI functionality:

* Clearly explain what data is sent
* Minimize source-code transmission
* Prefer metadata/graph retrieval
* Support local/private configurations where possible

Privacy should be treated as a product feature.

---

# 29. CLI

Eventually provide:

```bash
npx codeverse
```

Expected behavior:

```text
$ npx codeverse

CodeVerse

✓ Repository detected
✓ 1,284 files discovered
✓ TypeScript analyzed
✓ Dependencies detected
✓ Graph generated

Opening CodeVerse...
```

No complicated setup for basic usage.

---

# 30. MONOREPO STRUCTURE

Prefer a clean monorepo architecture.

Example:

```text
codeverse/
│
├── apps/
│   ├── web/
│   └── docs/
│
├── packages/
│   ├── analyzer/
│   ├── graph-core/
│   ├── graph-layout/
│   ├── renderer/
│   ├── gestures/
│   └── ai/
│
├── cli/
│
├── tests/
│
└── README.md
```

Modify this structure if a better architecture is identified.

Do not create packages merely for the sake of creating packages.

---

# 31. ANALYZER ARCHITECTURE

The analyzer should be pluggable.

Conceptually:

```typescript
interface LanguageAnalyzer {
  canAnalyze(file: string): boolean;

  analyze(
    source: string,
    context: AnalysisContext
  ): AnalysisResult;
}
```

Potential analyzers:

```text
TypeScriptAnalyzer
JavaScriptAnalyzer
PythonAnalyzer
JavaAnalyzer
```

Only implement TypeScript/JavaScript initially.

---

# 32. GRAPH CORE

Create a framework-independent graph representation.

The graph core should know:

* Nodes
* Edges
* Relationships
* Hierarchy
* Metadata
* Selection
* Filtering
* Traversal

It should NOT know about:

* React
* Three.js
* GitHub
* MediaPipe

This separation is extremely important.

---

# 33. RENDERER

The renderer consumes graph data.

Possible architecture:

```text
Graph Core
     ↓
Renderer Adapter
     ↓
2D Renderer / 3D Renderer
```

This allows future renderers.

---

# 34. INTERACTION SYSTEM

Create normalized interaction events.

Examples:

```text
SELECT_NODE
ROTATE_CAMERA
ZOOM_CAMERA
PAN_CAMERA
FOCUS_NODE
EXPAND_NODE
COLLAPSE_NODE
```

Inputs:

```text
Mouse
Keyboard
Touch
Gesture
VR controller
```

should all eventually produce the same interaction events.

---

# 35. ERROR HANDLING

The application must gracefully handle:

* Invalid GitHub URL
* Private repository without access
* Repository not found
* Unsupported files
* Huge repository
* Parsing errors
* Broken imports
* Cyclic dependencies
* Malformed source
* Network failure

Never allow one broken file to crash the entire analysis.

Example:

```text
⚠ 14 files could not be parsed.

The rest of the repository was successfully analyzed.
```

---

# 36. TESTING

Build tests from the beginning.

At minimum:

### Analyzer tests

Given:

```typescript
import { User } from "./User";
```

expect:

```text
import relationship
```

### Graph tests

Validate:

* Nodes
* Edges
* Traversal
* Filtering
* Hierarchy

### UI tests

Test important interactions.

### Performance tests

Test repositories of increasing sizes.

Create small synthetic repositories for benchmarking.

---

# 37. SECURITY

Do not execute arbitrary repository code.

The analyzer should parse source code without running it.

Be careful with:

* GitHub tokens
* Repository credentials
* Uploaded source
* Malicious repository contents
* Path traversal
* Dependency installation

Never automatically execute:

```bash
npm install
npm run build
npm run script
```

on an untrusted repository.

---

# 38. PRODUCT ROADMAP

## MVP 1

```text
GitHub URL
↓
Repository ingestion
↓
JS/TS analysis
↓
Dependency graph
↓
2D visualization
```

## MVP 2

```text
3D visualization
↓
Search
↓
Filters
↓
Node details
↓
Expand/collapse
```

## MVP 3

```text
Local CLI

npx codeverse
```

## MVP 4

```text
Hand gestures
```

## MVP 5

```text
Architecture detection
Database visualization
Impact analysis
```

## MVP 6

```text
AI repository assistant
```

## MVP 7

```text
Git history
Architecture evolution
```

## MVP 8

```text
WebXR / AR
VR
Spatial code exploration
```

---

# 39. BUSINESS MODEL — FUTURE

Potential model:

### Free

* Public repositories
* Basic visualization
* Limited analysis

### Pro

* Private repositories
* Advanced analysis
* 3D visualization
* AI repository assistant
* Impact analysis
* Database visualization
* Export

### Team

* Shared repositories
* Collaboration
* Organization management
* GitHub integration
* CI/CD integration

### Enterprise

* Self-hosted
* SSO
* Security controls
* Private infrastructure
* Large repositories
* Enterprise support

Do not implement payments in the MVP.

---

# 40. COMPETITIVE POSITIONING

Do not position CodeVerse simply as:

> "A tool that visualizes GitHub repositories."

Existing tools can already visualize dependencies and architecture.

The stronger positioning is:

> "CodeVerse is an interactive codebase intelligence platform that lets developers visually explore, understand, and reason about software architecture."

Long-term differentiation:

```text
Codebase
   ↓
Architecture intelligence
   ↓
Interactive visualization
   ↓
3D exploration
   ↓
Natural-language questions
   ↓
Hand interaction
   ↓
AR / spatial computing
```

---

# 41. IMPORTANT PRODUCT RULE

Do not build features simply because they are technically cool.

Every feature should answer:

> "Does this help a developer understand or work with the codebase?"

If not, deprioritize it.

---

# 42. DEVELOPMENT PROCESS

Before coding:

### Step 1

Inspect the current workspace.

Determine:

* Existing files
* Existing framework
* Existing package manager
* Existing configuration
* Existing dependencies
* Existing Git state

### Step 2

Create an architecture proposal.

### Step 3

Identify the smallest MVP.

### Step 4

Create implementation tasks.

### Step 5

Implement one vertical slice first.

The first vertical slice should ideally be:

```text
Repository input
    ↓
Repository ingestion
    ↓
JS/TS analysis
    ↓
Graph
    ↓
Basic visualization
```

Make that work end-to-end before adding advanced features.

---

# 43. IMPORTANT CODING RULES

Use:

* TypeScript
* Strong typing
* Clean abstractions
* Small reusable functions
* Clear naming
* Meaningful comments only
* Tests for core logic

Avoid:

* Giant files
* Giant React components
* Hardcoded repository assumptions
* Tight coupling
* Premature abstraction
* Unnecessary dependencies
* Global mutable state
* Rendering everything at once

---

# 44. DECISION-MAKING RULE

If there are multiple possible technologies, do not blindly choose one.

Evaluate:

```text
Performance
Developer experience
Bundle size
Maintenance
Community
Browser compatibility
Scalability
License
```

Then choose the simplest option that satisfies the requirements.

Document important architectural decisions.

---

# 45. DOCUMENTATION

Create:

```text
README.md
ARCHITECTURE.md
CONTRIBUTING.md
```

README should eventually explain:

```text
What CodeVerse is
Why it exists
Screenshots/demo
Installation
Usage
CLI
Architecture
Supported languages
Roadmap
Contributing
```

---

# 46. FIRST DEVELOPMENT TASK

Before implementing advanced functionality, build the smallest working proof of concept.

Target:

```text
User enters GitHub repository URL

        ↓

Repository files retrieved

        ↓

TypeScript/JavaScript files identified

        ↓

Imports analyzed

        ↓

Normalized graph generated

        ↓

Basic 2D graph displayed
```

Once this works reliably:

```text
2D
 ↓
3D
 ↓
Interaction
 ↓
Gesture
```

---

# 47. DO NOT DO THESE YET

Do NOT initially build:

* Full AR
* VR
* Payments
* Authentication
* Team collaboration
* Enterprise accounts
* Every programming language
* Advanced AI agent
* Complex database inference
* Git history visualization
* VS Code extension

First prove:

> "Developers can provide a repository and understand it better using CodeVerse."

---

# 48. SUCCESS CRITERIA FOR THE FIRST VERSION

A developer should be able to:

1. Open CodeVerse.
2. Enter a public GitHub repository.
3. Click Analyze.
4. Wait for analysis.
5. See the repository structure visually.
6. Search for a file/module.
7. Select a node.
8. See its relationships.
9. Expand/collapse areas.
10. Switch between 2D and 3D.
11. Navigate the 3D graph smoothly.
12. Understand the repository better than they could from the raw folder tree.

---

# 49. LONG-TERM VISION

The final experience should feel like:

```text
                 CODEBASE
                    │
                    ↓
          ┌───────────────────┐
          │ Code Intelligence  │
          └─────────┬─────────┘
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       Visual               AI
     Exploration          Assistant
          │                   │
          ↓                   ↓
         3D              Questions
          │                   │
          └─────────┬─────────┘
                    ↓
             Spatial Computing
                    ↓
                AR / VR
```

Imagine a developer joining a huge unfamiliar project.

Instead of spending hours navigating:

```text
src/
components/
services/
hooks/
utils/
...
```

they open CodeVerse and see:

```text
                   PROJECT
                      ●
              ┌───────┼───────┐
              ↓       ↓       ↓
             AUTH    USERS   PAYMENTS
              ●       ●       ●
             / \      │      / \
            ●   ●     ●     ●   ●
```

They click:

```text
PAYMENTS
```

and CodeVerse explains and highlights:

```text
Checkout
   ↓
PaymentController
   ↓
PaymentService
   ↓
StripeClient
   ↓
PaymentRepository
   ↓
Database
```

Then they ask:

> "What happens if I change PaymentService?"

The affected architecture lights up.

That is the ultimate CodeVerse experience.

---

# 50. YOUR IMMEDIATE INSTRUCTION

Start by inspecting the current workspace and determining what already exists.

Then provide:

## A. Current workspace analysis

## B. Recommended architecture

## C. MVP implementation plan

## D. Technology decisions and rationale

## E. Folder structure

## F. First vertical slice

## G. Risks and technical challenges

## H. Exact implementation steps

After that, begin implementing the first vertical slice.

Do not wait for unnecessary confirmation if the correct implementation path is clear.

However, do NOT make major irreversible architectural decisions without explaining them first.

Keep the MVP small.

Build the foundation correctly.

The ultimate goal is not merely to create a graph.

The goal is to build:

# "The visual operating system for understanding a codebase."

Start with the smallest useful version and evolve toward that vision.
