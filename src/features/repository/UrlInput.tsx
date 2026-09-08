import React, { useState } from 'react';
import { Github, Zap, AlertCircle, ArrowRight, Code2 } from 'lucide-react';
import { SAMPLE_REPOSITORIES, SampleRepoConfig } from '../../services/fixtures/sampleRepos';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  onSelectSample: (sample: SampleRepoConfig) => void;
  isAnalyzing: boolean;
  error?: string | null;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  onAnalyze,
  onSelectSample,
  isAnalyzing,
  error,
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
      {/* Hero Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          <Code2 size={16} /> Phase 1 — JavaScript &amp; TypeScript Dependency Mapping
        </div>
        <h1
          style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
          }}
        >
          Understand any codebase visually.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
          Instantly transform public GitHub JavaScript and TypeScript repositories into normalized interactive dependency graphs.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem',
            gap: '0.5rem',
            maxWidth: '680px',
            margin: '0 auto',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          <div style={{ paddingLeft: '1rem', color: 'var(--text-muted)' }}>
            <Github size={22} />
          </div>
          <input
            type="text"
            placeholder="e.g. https://github.com/facebook/react or pmndrs/zustand"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isAnalyzing}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '1rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.75rem 0.5rem',
            }}
          />
          <button type="submit" className="btn-primary" disabled={isAnalyzing || !url.trim()}>
            {isAnalyzing ? (
              <>Analyzing...</>
            ) : (
              <>
                Analyze Repository <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Alert Display */}
      {error && (
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'left',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.9rem' }}>{error}</div>
        </div>
      )}

      {/* Quick Start Presets */}
      <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'left' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            fontWeight: 500,
          }}
        >
          <Zap size={16} color="var(--accent-amber)" /> Or explore instant demo repositories:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {SAMPLE_REPOSITORIES.map((sample) => (
            <div
              key={sample.id}
              className="glass-panel glass-panel-hover"
              onClick={() => onSelectSample(sample)}
              style={{
                padding: '1rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sample.name}</span>
                <span className="badge badge-ts">{sample.stars} ★</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', height: '2.4rem', overflow: 'hidden' }}>
                {sample.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
