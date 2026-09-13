import React, { useEffect, useState } from 'react';

interface ScanEffectOverlayProps {
  active: boolean;
  onComplete?: () => void;
}

export const ScanEffectOverlay: React.FC<ScanEffectOverlayProps> = ({ active, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    let startTime: number | null = null;
    const duration = 1000; // 1 second scan animation

    let animFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(1.0, elapsed / duration);

      setProgress(p);

      if (p < 1.0) {
        animFrame = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animFrame = requestAnimationFrame(animate);

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [active, onComplete]);

  if (!active) return null;

  const scanY = progress * 100; // Percentage 0% to 100%

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Blue Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 1 - Math.abs(progress - 0.5) * 1.5,
          transition: 'opacity 0.1s linear',
        }}
      />

      {/* Trailing Scan Curtain */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${scanY}%`,
          background: 'linear-gradient(to bottom, rgba(56, 189, 248, 0.0) 0%, rgba(56, 189, 248, 0.25) 90%, rgba(0, 243, 255, 0.6) 100%)',
          borderBottom: '3px solid #00f3ff',
          boxShadow: '0 0 30px #00f3ff, 0 0 60px #38bdf8, inset 0 0 40px rgba(56, 189, 248, 0.3)',
        }}
      />

      {/* Laser Beam Line */}
      <div
        style={{
          position: 'absolute',
          top: `${scanY}%`,
          left: 0,
          width: '100%',
          height: '4px',
          background: '#ffffff',
          boxShadow: '0 0 15px #00f3ff, 0 0 30px #38bdf8, 0 0 45px #00f3ff',
        }}
      />

      {/* Central Holographic HUD Badge */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(7, 9, 14, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '2px solid #00f3ff',
          borderRadius: '16px',
          padding: '1rem 2rem',
          boxShadow: '0 0 40px rgba(0, 243, 255, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#ffffff',
          opacity: progress > 0.1 && progress < 0.9 ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div style={{ fontSize: '1.8rem' }}>🤙</div>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.08em', color: '#38bdf8', textShadow: '0 0 12px #38bdf8' }}>
          SYSTEM SCAN RESET
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
          re-centering graph • clearing selection
        </div>
      </div>
    </div>
  );
};
