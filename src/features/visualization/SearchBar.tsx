import React from 'react';
import { Search, Filter, RefreshCcw, Layers } from 'lucide-react';
import { NormalizedGraphModel } from '../../core/graph/NormalizedGraphModel';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'all' | 'file' | 'directory' | 'module';
  onFilterChange: (type: 'all' | 'file' | 'directory' | 'module') => void;
  graphModel: NormalizedGraphModel | null;
  onResetView: () => void;
  onNewSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  graphModel,
  onResetView,
  onNewSearch,
}) => {
  const stats = graphModel?.getStats();
  const repoRef = graphModel?.getRepoRef();

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        zIndex: 40,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* Left Control Bar */}
      <div
        className="glass-panel"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.75rem',
        }}
      >
        {/* Repo Info Header */}
        {repoRef && (
          <div
            style={{
              paddingRight: '0.75rem',
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
              {repoRef.owner}/{repoRef.repo}
            </span>
            <button
              onClick={onNewSearch}
              title="Analyze another repository"
              className="btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Change Repo
            </button>
          </div>
        )}

        {/* Live Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search nodes in graph..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              width: '180px',
            }}
          />
        </div>

        {/* Filter Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value as any)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all" style={{ background: '#0f172a' }}>All Nodes</option>
            <option value="file" style={{ background: '#0f172a' }}>Files Only</option>
          </select>
        </div>
      </div>

      {/* Right Stats Bar */}
      {stats && (
        <div
          className="glass-panel"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Files: <strong style={{ color: 'var(--text-main)' }}>{stats.totalFilesAnalyzed}</strong>
          </div>
          <div>
            Imports: <strong style={{ color: '#38bdf8' }}>{stats.totalImportsFound}</strong>
          </div>
          <div>
            Edges: <strong style={{ color: '#818cf8' }}>{stats.totalEdgesCreated}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {stats.durationMs}ms
          </div>
        </div>
      )}
    </div>
  );
};
