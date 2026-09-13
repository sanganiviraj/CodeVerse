import React, { useEffect, useRef } from 'react';
import { HandLandmarksPayload, GestureState, HandLandmark } from '../gestures/gestureTypes';

interface HandOverlayCanvasProps {
  landmarksPayload: HandLandmarksPayload | null;
  gestureState: GestureState;
  activeZoomScale?: number;
}

// MediaPipe 21 hand landmarks bone connections
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [9, 10], [10, 11], [11, 12],
  // Ring finger
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm transverse connections
  [5, 9], [9, 13], [13, 17],
];

export const HandOverlayCanvas: React.FC<HandOverlayCanvasProps> = ({
  landmarksPayload,
  gestureState,
  activeZoomScale = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Auto resize canvas to parent
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    if (!landmarksPayload || !landmarksPayload.hands || landmarksPayload.hands.length === 0) {
      return;
    }

    const { hands } = landmarksPayload;

    // Helper to map normalized coordinates (0..1) to screen pixels (flipped horizontally for selfie camera)
    const mapPoint = (lm: HandLandmark) => ({
      x: (1 - lm.x) * width,
      y: lm.y * height,
    });

    const now = Date.now();
    const pulseFactor = Math.sin(now / 150) * 0.2 + 1.0; // 0.8 to 1.2 pulsing scale

    // -------------------------------------------------------------
    // DRAW DUAL HAND CONNECTIVITY & ZOOM HUD (If 2 hands detected)
    // -------------------------------------------------------------
    if (hands.length >= 2) {
      const centerA = mapPoint(hands[0].pinchPoint as any);
      const centerB = mapPoint(hands[1].pinchPoint as any);

      // Connecting energy laser line between two hands
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerA.x, centerA.y);
      ctx.lineTo(centerB.x, centerB.y);
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      // Midpoint Holographic HUD Box
      const midX = (centerA.x + centerB.x) / 2;
      const midY = (centerA.y + centerB.y) / 2;

      ctx.save();
      ctx.translate(midX, midY);

      // HUD Background Pill
      const hudWidth = 140;
      const hudHeight = 32;
      ctx.fillStyle = 'rgba(7, 9, 14, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.roundRect(-hudWidth / 2, -hudHeight / 2, hudWidth, hudHeight, 8);
      ctx.fill();
      ctx.stroke();

      // HUD Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⚡ STRETCH ZOOM ${(activeZoomScale * 100).toFixed(0)}%`, 0, 0);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // DRAW INDIVIDUAL HAND SKELETON & GLOWING JOINTS
    // -------------------------------------------------------------
    hands.forEach((handData, handIndex) => {
      const { landmarks, isPinching, label } = handData;
      const screenPoints = landmarks.map(mapPoint);

      // 1. Draw Skeleton Bones (Neon Laser Connections)
      ctx.save();
      ctx.strokeStyle = isPinching ? '#a855f7' : '#00f3ff';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = isPinching ? '#c084fc' : '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.lineCap = 'round';

      HAND_CONNECTIONS.forEach(([i, j]) => {
        const p1 = screenPoints[i];
        const p2 = screenPoints[j];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
      ctx.restore();

      // 2. Draw Pinch Energy Arc (Lightning between Index Tip landmark 8 and Thumb Tip landmark 4)
      if (isPinching) {
        const thumbPt = screenPoints[4];
        const indexPt = screenPoints[8];
        if (thumbPt && indexPt) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(thumbPt.x, thumbPt.y);
          // Add dynamic midpoint jitter for futuristic electric plasma arc
          const midX = (thumbPt.x + indexPt.x) / 2 + (Math.random() - 0.5) * 8;
          const midY = (thumbPt.y + indexPt.y) / 2 + (Math.random() - 0.5) * 8;
          ctx.quadraticCurveTo(midX, midY, indexPt.x, indexPt.y);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 18;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 3. Draw Joint Landmark Nodes (Glowing White & Cyan Spheres)
      screenPoints.forEach((pt, idx) => {
        const isFingertip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
        const radius = isFingertip ? 4.5 : 3.0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius * (isFingertip ? pulseFactor : 1.0), 0, 2 * Math.PI);
        ctx.fillStyle = isFingertip ? (isPinching ? '#f43f5e' : '#ffffff') : '#e0f2fe';
        ctx.shadowColor = isFingertip ? '#38bdf8' : '#0284c7';
        ctx.shadowBlur = isFingertip ? 12 : 6;
        ctx.fill();

        // Outer neon ring on Index Tip (Landmark 8) and Thumb Tip (Landmark 4)
        if (idx === 8 || idx === 4) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (radius + 4) * pulseFactor, 0, 2 * Math.PI);
          ctx.strokeStyle = isPinching ? '#f43f5e' : '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      });

      // 4. Draw Futuristic Target Cursor Reticle at Pinch/Pointer Position
      const pinchPt = mapPoint(handData.pinchPoint as any);
      ctx.save();
      ctx.translate(pinchPt.x, pinchPt.y);

      // Rotating outer crosshair arcs
      const rotAngle = (now / 1000) * (handIndex % 2 === 0 ? 1 : -1);
      ctx.rotate(rotAngle);

      ctx.strokeStyle = isPinching ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = isPinching ? '#f43f5e' : '#38bdf8';
      ctx.shadowBlur = 12;

      // Draw 4 corner reticle brackets
      const bracketSize = isPinching ? 10 : 14;
      const bracketGap = isPinching ? 6 : 9;

      ctx.beginPath();
      // Top-Left
      ctx.moveTo(-bracketSize, -bracketGap); ctx.lineTo(-bracketGap, -bracketGap); ctx.lineTo(-bracketGap, -bracketSize);
      // Top-Right
      ctx.moveTo(bracketSize, -bracketGap); ctx.lineTo(bracketGap, -bracketGap); ctx.lineTo(bracketGap, -bracketSize);
      // Bottom-Left
      ctx.moveTo(-bracketSize, bracketGap); ctx.lineTo(-bracketGap, bracketGap); ctx.lineTo(-bracketGap, bracketSize);
      // Bottom-Right
      ctx.moveTo(bracketSize, bracketGap); ctx.lineTo(bracketGap, bracketGap); ctx.lineTo(bracketGap, bracketSize);
      ctx.stroke();

      // Center glowing point
      ctx.beginPath();
      ctx.arc(0, 0, isPinching ? 4 : 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = isPinching ? '#f43f5e' : '#ffffff';
      ctx.fill();

      ctx.restore();

      // 5. Draw Holographic Hand Status Label floating near Wrist (Landmark 0)
      const wristPt = screenPoints[0];
      if (wristPt) {
        ctx.save();
        const tagX = wristPt.x;
        const tagY = wristPt.y + 24;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;

        const labelText = `${label.toUpperCase()} HAND • ${
          gestureState === 'ZOOMING'
            ? 'ZOOM'
            : isPinching
            ? 'PINCH'
            : 'TRACKING'
        }`;

        ctx.font = '600 10px system-ui, sans-serif';
        const textMetrics = ctx.measureText(labelText);
        const padX = 8;
        const padY = 4;
        const boxW = textMetrics.width + padX * 2;
        const boxH = 16 + padY;

        ctx.beginPath();
        ctx.roundRect(tagX - boxW / 2, tagY - boxH / 2, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isPinching ? '#f43f5e' : '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, tagX, tagY);
        ctx.restore();
      }
    });
  }, [landmarksPayload, gestureState, activeZoomScale]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
};
