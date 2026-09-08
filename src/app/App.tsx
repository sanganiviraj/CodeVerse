import React, { useState } from 'react';
import { UrlInput } from '../features/repository/UrlInput';
import { ProgressModal } from '../features/analysis/ProgressModal';
import { GraphCanvas } from '../features/graph/GraphCanvas';
import { InspectorPanel } from '../features/visualization/InspectorPanel';
import { SearchBar } from '../features/visualization/SearchBar';
import { DependencyAnalyzer } from '../services/analysis/dependencyAnalyzer';
import { NormalizedGraphModel } from '../core/graph/NormalizedGraphModel';
import { GraphNode, AnalysisProgress } from '../core/types/graph';
import { SampleRepoConfig } from '../services/fixtures/sampleRepos';

export const App: React.FC = () => {
  const [graphModel, setGraphModel] = useState<NormalizedGraphModel | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'file' | 'directory' | 'module'>('all');

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError(null);
    setSelectedNode(null);

    try {
      const model = await DependencyAnalyzer.analyzeRepository(url, (p) => {
        setProgress(p);
      });
      setGraphModel(model);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze repository.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
      setProgress(null);
    }
  };

  const handleSelectSample = (sample: SampleRepoConfig) => {
    setError(null);
    setSelectedNode(null);
    setSearchQuery('');
    setGraphModel(sample.modelFactory());
  };

  const handleNewSearch = () => {
    setGraphModel(null);
    setSelectedNode(null);
    setSearchQuery('');
    setError(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Application Header */}
      <header
        style={{
          height: '56px',
          background: 'rgba(7, 9, 14, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          zIndex: 60,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={handleNewSearch}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#fff',
            }}
          >
            CV
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            CodeVerse
          </span>
          <span className="badge badge-ts" style={{ marginLeft: '0.25rem' }}>Phase 1</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          JavaScript & TypeScript Dependency Intelligence
        </div>
      </header>

      {/* Main Content View */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Progress Modal */}
        <ProgressModal progress={progress} />

        {!graphModel ? (
          /* Landing Screen */
          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <UrlInput
              onAnalyze={handleAnalyze}
              onSelectSample={handleSelectSample}
              isAnalyzing={isAnalyzing}
              error={error}
            />
          </div>
        ) : (
          /* Interactive Graph View */
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
              graphModel={graphModel}
              onResetView={() => setSelectedNode(null)}
              onNewSearch={handleNewSearch}
            />

            <GraphCanvas
              graphModel={graphModel}
              selectedNodeId={selectedNode?.id}
              searchQuery={searchQuery}
              filterType={filterType}
              onSelectNode={setSelectedNode}
            />

            <InspectorPanel
              selectedNode={selectedNode}
              graphModel={graphModel}
              onSelectNode={setSelectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
};
