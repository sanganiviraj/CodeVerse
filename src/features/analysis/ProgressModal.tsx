import React from 'react';
import { AnalysisProgress } from '../../core/types/graph';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ProgressModalProps {
  progress: AnalysisProgress | null;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ progress }) => {
  if (!progress) return null;

  const stepsList = [
    { key: 'validating', label: 'GitHub Repository Validated' },
    { key: 'fetching_tree', label: 'Source File Tree Discovered' },
    { key: 'fetching_sources', label: 'Source Code Retrieved' },
    { key: 'parsing_ast', label: 'TypeScript / JavaScript AST Parsed' },
    { key: 'building_graph', label: 'Normalized Dependency Graph Built' },
  ];

  const getStepStatus = (stepKey: string) => {
    const order = ['validating', 'fetching_tree', 'fetching_sources', 'parsing_ast', 'building_graph', 'complete'];
    const currentIndex = order.indexOf(progress.step);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex || progress.step === 'complete') {
      return 'completed';
    }
    if (stepIndex === currentIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 9, 14, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2rem',
          textAlign: 'left',
          border: '1px solid rgba(56, 189, 248, 0.4)',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Analyzing Repository Architecture...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {progress.message}
        </p>

        {/* Progress Bar */}
        <div
          style={{
            height: '6px',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress.percentage}%`,
              background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stepsList.map((s) => {
            const status = getStepStatus(s.key);
            return (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: status === 'pending' ? 'var(--text-dim)' : 'var(--text-main)',
                }}
              >
                {status === 'completed' && <CheckCircle2 size={18} color="#34d399" />}
                {status === 'active' && <Loader2 size={18} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />}
                {status === 'pending' && (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                    }}
                  />
                )}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
