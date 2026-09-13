import React, { useEffect, useRef } from 'react';
import { HandOverlayCanvas } from './HandOverlayCanvas';
import { HandLandmarksPayload, GestureState } from '../gestures/gestureTypes';

export type CameraState = 'inactive' | 'requesting' | 'active' | 'denied' | 'unavailable';

interface CameraViewProps {
  onCameraStatusChange?: (status: CameraState, errorMessage?: string) => void;
  onVideoReady?: (video: HTMLVideoElement) => void;
  landmarksPayload?: HandLandmarksPayload | null;
  gestureState?: GestureState;
  activeZoomScale?: number;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCameraStatusChange,
  onVideoReady,
  landmarksPayload = null,
  gestureState = 'IDLE',
  activeZoomScale = 1.0,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      onCameraStatusChange?.('requesting');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          onCameraStatusChange?.('unavailable', 'Camera API (getUserMedia) is not supported by your browser.');
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          if (isMounted) {
            onCameraStatusChange?.('active');
            onVideoReady?.(videoRef.current);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Camera permission denied or camera device unavailable.';
        if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          onCameraStatusChange?.('denied', msg);
        } else {
          onCameraStatusChange?.('unavailable', msg);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#07090e',
        zIndex: 0,
      }}
    >
      {/* Live Webcam Stream */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Horizontal mirror for natural selfie mode
          display: 'block',
        }}
      />

      {/* Futuristic Hand Skeleton Overlay Canvas */}
      <HandOverlayCanvas
        landmarksPayload={landmarksPayload}
        gestureState={gestureState}
        activeZoomScale={activeZoomScale}
      />

      {/* Left-Side Black Gradient Overlay for High Contrast Graph Readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(to right, rgba(7, 9, 14, 0.95) 0%, rgba(7, 9, 14, 0.75) 30%, rgba(7, 9, 14, 0.3) 60%, transparent 100%)',
          zIndex: 1,
        }}
      />
    </div>
  );
};

