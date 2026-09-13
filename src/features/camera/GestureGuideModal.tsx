import React from 'react';
import { Hand, Grab, Move, Maximize2, MousePointerClick, Check } from 'lucide-react';

interface GestureGuideModalProps {
  onDismiss: () => void;
}

export const GestureGuideModal: React.FC<GestureGuideModalProps> = ({ onDismiss }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.75), 0 0 25px rgba(56, 189, 248, 0.25)',
        maxWidth: '580px',
        width: '92%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              display: 'flex',
            }}
          >
            <Hand size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Futuristic Spatial Hand Controls
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              Real-time glowing skeleton overlay & multi-hand spatial interaction.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.4rem 0.9rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Check size={14} /> Got it
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.35rem' }}>
          <Hand size={22} style={{ color: '#94a3b8' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e0f2fe' }}>Open Hand</span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Unbent palm = Idle (No action)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.35rem' }}>
          <div style={{ display: 'flex', gap: '4px', color: '#38bdf8' }}>
            <Grab size={20} />
            <Move size={20} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e0f2fe' }}>1-Hand Pan</span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Pinch thumb & index to drag</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.35rem' }}>
          <Maximize2 size={22} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e0f2fe' }}>2-Hand Zoom</span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Pinch both & stretch apart/together</span>
        </div>
      </div>
    </div>
  );
};

