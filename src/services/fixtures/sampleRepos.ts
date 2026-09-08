import { NormalizedGraphModel } from '../../core/graph/NormalizedGraphModel';
import { RepositoryRef } from '../../core/types/graph';

export interface SampleRepoConfig {
  id: string;
  name: string;
  description: string;
  owner: string;
  repo: string;
  url: string;
  stars: string;
  language: string;
  modelFactory: () => NormalizedGraphModel;
}

export const SAMPLE_REPOSITORIES: SampleRepoConfig[] = [
  {
    id: 'zustand',
    name: 'Zustand',
    description: 'Bear necessities for state management in React',
    owner: 'pmndrs',
    repo: 'zustand',
    url: 'https://github.com/pmndrs/zustand',
    stars: '45k',
    language: 'TypeScript',
    modelFactory: () => createZustandSampleGraph(),
  },
  {
    id: 'redux-toolkit',
    name: 'Redux Toolkit',
    description: 'The official, opinionated, batteries-included toolset for efficient Redux development',
    owner: 'reduxjs',
    repo: 'redux-toolkit',
    url: 'https://github.com/reduxjs/redux-toolkit',
    stars: '10k',
    language: 'TypeScript',
    modelFactory: () => createReduxSampleGraph(),
  },
  {
    id: 'codeverse-core',
    name: 'CodeVerse Engine',
    description: 'Sample CodeVerse architecture dependency map',
    owner: 'codeverse',
    repo: 'codeverse-core',
    url: 'https://github.com/codeverse/codeverse-core',
    stars: '1.2k',
    language: 'TypeScript',
    modelFactory: () => createCodeVerseSampleGraph(),
  },
];

function createZustandSampleGraph(): NormalizedGraphModel {
  const repoRef: RepositoryRef = {
    owner: 'pmndrs',
    repo: 'zustand',
    branch: 'main',
    url: 'https://github.com/pmndrs/zustand',
    isSample: true,
  };

  const model = new NormalizedGraphModel(repoRef, {
    totalFilesDiscovered: 18,
    totalFilesAnalyzed: 14,
    totalFilesSkipped: 4,
    totalImportsFound: 24,
    totalEdgesCreated: 16,
    durationMs: 420,
    languagesCount: { typescript: 10, tsx: 4, javascript: 0, jsx: 0, json: 0, unknown: 0 },
    skippedFiles: [],
  });

  // Nodes
  const files = [
    { id: 'src/index.ts', name: 'index.ts', path: 'src/index.ts', type: 'file', language: 'typescript', isEntrypoint: true },
    { id: 'src/vanilla.ts', name: 'vanilla.ts', path: 'src/vanilla.ts', type: 'file', language: 'typescript' },
    { id: 'src/react.ts', name: 'react.ts', path: 'src/react.ts', type: 'file', language: 'typescript' },
    { id: 'src/middleware.ts', name: 'middleware.ts', path: 'src/middleware.ts', type: 'file', language: 'typescript' },
    { id: 'src/middleware/devtools.ts', name: 'devtools.ts', path: 'src/middleware/devtools.ts', type: 'file', language: 'typescript' },
    { id: 'src/middleware/persist.ts', name: 'persist.ts', path: 'src/middleware/persist.ts', type: 'file', language: 'typescript' },
    { id: 'src/middleware/immer.ts', name: 'immer.ts', path: 'src/middleware/immer.ts', type: 'file', language: 'typescript' },
    { id: 'src/middleware/combine.ts', name: 'combine.ts', path: 'src/middleware/combine.ts', type: 'file', language: 'typescript' },
    { id: 'src/shallow.ts', name: 'shallow.ts', path: 'src/shallow.ts', type: 'file', language: 'typescript' },
    { id: 'src/traditional.ts', name: 'traditional.ts', path: 'src/traditional.ts', type: 'file', language: 'typescript' },
    { id: 'src/utils/storage.ts', name: 'storage.ts', path: 'src/utils/storage.ts', type: 'file', language: 'typescript' },
  ];

  for (const f of files) {
    model.addNode({
      id: f.id,
      name: f.name,
      path: f.path,
      type: f.type as any,
      language: f.language as any,
      importsCount: 0,
      importedByCount: 0,
      isEntrypoint: f.isEntrypoint,
    });
  }

  // Edges
  const edges = [
    { source: 'src/index.ts', target: 'src/react.ts', symbols: ['create', 'useStore'] },
    { source: 'src/index.ts', target: 'src/vanilla.ts', symbols: ['createStore'] },
    { source: 'src/react.ts', target: 'src/vanilla.ts', symbols: ['StoreApi', 'createStore'] },
    { source: 'src/react.ts', target: 'src/traditional.ts', symbols: ['useStoreWithEqualityFn'] },
    { source: 'src/middleware.ts', target: 'src/middleware/devtools.ts', symbols: ['devtools'] },
    { source: 'src/middleware.ts', target: 'src/middleware/persist.ts', symbols: ['persist'] },
    { source: 'src/middleware.ts', target: 'src/middleware/immer.ts', symbols: ['immer'] },
    { source: 'src/middleware.ts', target: 'src/middleware/combine.ts', symbols: ['combine'] },
    { source: 'src/middleware/persist.ts', target: 'src/utils/storage.ts', symbols: ['createJSONStorage'] },
    { source: 'src/middleware/persist.ts', target: 'src/vanilla.ts', symbols: ['StateCreator'] },
    { source: 'src/middleware/devtools.ts', target: 'src/vanilla.ts', symbols: ['StateCreator'] },
    { source: 'src/traditional.ts', target: 'src/shallow.ts', symbols: ['shallow'] },
    { source: 'src/traditional.ts', target: 'src/vanilla.ts', symbols: ['useStore'] },
  ];

  for (const e of edges) {
    model.addEdge({
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      type: 'imports',
      importedSymbols: e.symbols,
    });
  }

  return model;
}

function createReduxSampleGraph(): NormalizedGraphModel {
  const repoRef: RepositoryRef = {
    owner: 'reduxjs',
    repo: 'redux-toolkit',
    branch: 'master',
    url: 'https://github.com/reduxjs/redux-toolkit',
    isSample: true,
  };

  const model = new NormalizedGraphModel(repoRef, {
    totalFilesDiscovered: 24,
    totalFilesAnalyzed: 18,
    totalFilesSkipped: 6,
    totalImportsFound: 32,
    totalEdgesCreated: 22,
    durationMs: 510,
    languagesCount: { typescript: 16, tsx: 2, javascript: 0, jsx: 0, json: 0, unknown: 0 },
    skippedFiles: [],
  });

  const files = [
    { id: 'src/index.ts', name: 'index.ts', path: 'src/index.ts', type: 'file', language: 'typescript', isEntrypoint: true },
    { id: 'src/createSlice.ts', name: 'createSlice.ts', path: 'src/createSlice.ts', type: 'file', language: 'typescript' },
    { id: 'src/createAsyncThunk.ts', name: 'createAsyncThunk.ts', path: 'src/createAsyncThunk.ts', type: 'file', language: 'typescript' },
    { id: 'src/configureStore.ts', name: 'configureStore.ts', path: 'src/configureStore.ts', type: 'file', language: 'typescript' },
    { id: 'src/createAction.ts', name: 'createAction.ts', path: 'src/createAction.ts', type: 'file', language: 'typescript' },
    { id: 'src/createReducer.ts', name: 'createReducer.ts', path: 'src/createReducer.ts', type: 'file', language: 'typescript' },
    { id: 'src/createEntityAdapter.ts', name: 'createEntityAdapter.ts', path: 'src/createEntityAdapter.ts', type: 'file', language: 'typescript' },
    { id: 'src/query/index.ts', name: 'index.ts', path: 'src/query/index.ts', type: 'file', language: 'typescript' },
    { id: 'src/query/createApi.ts', name: 'createApi.ts', path: 'src/query/createApi.ts', type: 'file', language: 'typescript' },
    { id: 'src/query/fetchBaseQuery.ts', name: 'fetchBaseQuery.ts', path: 'src/query/fetchBaseQuery.ts', type: 'file', language: 'typescript' },
    { id: 'src/utils/selectName.ts', name: 'selectName.ts', path: 'src/utils/selectName.ts', type: 'file', language: 'typescript' },
  ];

  for (const f of files) {
    model.addNode({
      id: f.id,
      name: f.name,
      path: f.path,
      type: f.type as any,
      language: f.language as any,
      importsCount: 0,
      importedByCount: 0,
      isEntrypoint: f.isEntrypoint,
    });
  }

  const edges = [
    { source: 'src/index.ts', target: 'src/configureStore.ts', symbols: ['configureStore'] },
    { source: 'src/index.ts', target: 'src/createSlice.ts', symbols: ['createSlice'] },
    { source: 'src/index.ts', target: 'src/createAsyncThunk.ts', symbols: ['createAsyncThunk'] },
    { source: 'src/index.ts', target: 'src/createEntityAdapter.ts', symbols: ['createEntityAdapter'] },
    { source: 'src/createSlice.ts', target: 'src/createAction.ts', symbols: ['createAction'] },
    { source: 'src/createSlice.ts', target: 'src/createReducer.ts', symbols: ['createReducer'] },
    { source: 'src/configureStore.ts', target: 'src/createReducer.ts', symbols: ['combineReducers'] },
    { source: 'src/query/index.ts', target: 'src/query/createApi.ts', symbols: ['createApi'] },
    { source: 'src/query/index.ts', target: 'src/query/fetchBaseQuery.ts', symbols: ['fetchBaseQuery'] },
    { source: 'src/query/createApi.ts', target: 'src/createAsyncThunk.ts', symbols: ['createAsyncThunk'] },
    { source: 'src/createAction.ts', target: 'src/utils/selectName.ts', symbols: ['formatActionName'] },
  ];

  for (const e of edges) {
    model.addEdge({
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      type: 'imports',
      importedSymbols: e.symbols,
    });
  }

  return model;
}

function createCodeVerseSampleGraph(): NormalizedGraphModel {
  const repoRef: RepositoryRef = {
    owner: 'codeverse',
    repo: 'codeverse-core',
    branch: 'main',
    url: 'https://github.com/codeverse/codeverse-core',
    isSample: true,
  };

  const model = new NormalizedGraphModel(repoRef, {
    totalFilesDiscovered: 15,
    totalFilesAnalyzed: 12,
    totalFilesSkipped: 3,
    totalImportsFound: 21,
    totalEdgesCreated: 15,
    durationMs: 380,
    languagesCount: { typescript: 8, tsx: 4, javascript: 0, jsx: 0, json: 0, unknown: 0 },
    skippedFiles: [],
  });

  const files = [
    { id: 'src/main.tsx', name: 'main.tsx', path: 'src/main.tsx', type: 'file', language: 'tsx', isEntrypoint: true },
    { id: 'src/app/App.tsx', name: 'App.tsx', path: 'src/app/App.tsx', type: 'file', language: 'tsx' },
    { id: 'src/core/graph/NormalizedGraphModel.ts', name: 'NormalizedGraphModel.ts', path: 'src/core/graph/NormalizedGraphModel.ts', type: 'file', language: 'typescript' },
    { id: 'src/core/types/graph.ts', name: 'graph.ts', path: 'src/core/types/graph.ts', type: 'file', language: 'typescript' },
    { id: 'src/services/github/githubService.ts', name: 'githubService.ts', path: 'src/services/github/githubService.ts', type: 'file', language: 'typescript' },
    { id: 'src/services/analysis/astParser.ts', name: 'astParser.ts', path: 'src/services/analysis/astParser.ts', type: 'file', language: 'typescript' },
    { id: 'src/services/analysis/dependencyAnalyzer.ts', name: 'dependencyAnalyzer.ts', path: 'src/services/analysis/dependencyAnalyzer.ts', type: 'file', language: 'typescript' },
    { id: 'src/features/repository/UrlInput.tsx', name: 'UrlInput.tsx', path: 'src/features/repository/UrlInput.tsx', type: 'file', language: 'tsx' },
    { id: 'src/features/graph/GraphCanvas.tsx', name: 'GraphCanvas.tsx', path: 'src/features/graph/GraphCanvas.tsx', type: 'file', language: 'tsx' },
    { id: 'src/features/visualization/InspectorPanel.tsx', name: 'InspectorPanel.tsx', path: 'src/features/visualization/InspectorPanel.tsx', type: 'file', language: 'tsx' },
  ];

  for (const f of files) {
    model.addNode({
      id: f.id,
      name: f.name,
      path: f.path,
      type: f.type as any,
      language: f.language as any,
      importsCount: 0,
      importedByCount: 0,
      isEntrypoint: f.isEntrypoint,
    });
  }

  const edges = [
    { source: 'src/main.tsx', target: 'src/app/App.tsx', symbols: ['App'] },
    { source: 'src/app/App.tsx', target: 'src/features/repository/UrlInput.tsx', symbols: ['UrlInput'] },
    { source: 'src/app/App.tsx', target: 'src/features/graph/GraphCanvas.tsx', symbols: ['GraphCanvas'] },
    { source: 'src/app/App.tsx', target: 'src/features/visualization/InspectorPanel.tsx', symbols: ['InspectorPanel'] },
    { source: 'src/app/App.tsx', target: 'src/services/analysis/dependencyAnalyzer.ts', symbols: ['DependencyAnalyzer'] },
    { source: 'src/services/analysis/dependencyAnalyzer.ts', target: 'src/services/github/githubService.ts', symbols: ['GitHubService'] },
    { source: 'src/services/analysis/dependencyAnalyzer.ts', target: 'src/services/analysis/astParser.ts', symbols: ['ASTParser'] },
    { source: 'src/services/analysis/dependencyAnalyzer.ts', target: 'src/core/graph/NormalizedGraphModel.ts', symbols: ['NormalizedGraphModel'] },
    { source: 'src/core/graph/NormalizedGraphModel.ts', target: 'src/core/types/graph.ts', symbols: ['GraphNode', 'GraphEdge'] },
    { source: 'src/services/analysis/astParser.ts', target: 'src/core/types/graph.ts', symbols: ['SupportedLanguage'] },
    { source: 'src/features/graph/GraphCanvas.tsx', target: 'src/core/graph/NormalizedGraphModel.ts', symbols: ['NormalizedGraphModel'] },
  ];

  for (const e of edges) {
    model.addEdge({
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      type: 'imports',
      importedSymbols: e.symbols,
    });
  }

  return model;
}
