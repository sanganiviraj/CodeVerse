import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Monitor, Hand, Grab, AlertTriangle } from 'lucide-react';
import { UrlInput } from '../features/repository/UrlInput';
import { ProgressModal } from '../features/analysis/ProgressModal';
import { GraphCanvas } from '../features/graph/GraphCanvas';
import { InspectorPanel } from '../features/visualization/InspectorPanel';
import { SearchBar } from '../features/visualization/SearchBar';
import { DependencyAnalyzer } from '../services/analysis/dependencyAnalyzer';
import { NormalizedGraphModel } from '../core/graph/NormalizedGraphModel';
import { GraphNode, AnalysisProgress } from '../core/types/graph';
import { SampleRepoConfig } from '../services/fixtures/sampleRepos';

// Phase 2 Camera & Hand Interaction imports
import { CameraView, CameraState } from '../features/camera/CameraView';
import { GestureGuideModal } from '../features/camera/GestureGuideModal';
import { HandTrackerService } from '../features/gestures/handTracker';
import { InteractionController, ViewportTransform } from '../features/interaction/interactionController';
import { GestureEvent, GestureState } from '../features/gestures/gestureTypes';
import { ReactFlowInstance } from '@xyflow/react';

export const App: React.FC = () => {
  const [graphModel, setGraphModel] = useState<NormalizedGraphModel | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'file' | 'directory' | 'module'>('all');

  // Phase 2 Viewport & Camera state
  const [viewMode, setViewMode] = useState<'normal' | 'camera'>('normal');
  const [cameraStatus, setCameraStatus] = useState<CameraState>('inactive');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState<boolean>(false);
  const [gestureState, setGestureState] = useState<GestureState>('IDLE');
  const [showGestureGuide, setShowGestureGuide] = useState<boolean>(true);
  const [externalViewport, setExternalViewport] = useState<ViewportTransform | null>(null);
  const [landmarksPayload, setLandmarksPayload] = useState<import('../features/gestures/gestureTypes').HandLandmarksPayload | null>(null);

  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const handTrackerRef = useRef<HandTrackerService | null>(null);
  const interactionControllerRef = useRef<InteractionController>(new InteractionController());
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  const isCameraMode = viewMode === 'camera';

  // Clean up hand tracking resources when leaving camera mode
  const stopCameraMode = useCallback(() => {
    if (handTrackerRef.current) {
      handTrackerRef.current.stop();
      handTrackerRef.current = null;
    }
    setHandDetected(false);
    setGestureState('IDLE');
    setLandmarksPayload(null);
    setCameraStatus('inactive');
  }, []);

  const handleToggleViewMode = (mode: 'normal' | 'camera') => {
    if (mode === viewMode) return;
    if (mode === 'normal') {
      stopCameraMode();
    } else {
      setCameraError(null);
    }
    setViewMode(mode);
  };

  const handleVideoReady = useCallback(async (video: HTMLVideoElement) => {
    if (handTrackerRef.current) {
      handTrackerRef.current.stop();
    }

    const tracker = new HandTrackerService();
    handTrackerRef.current = tracker;

    await tracker.initialize(video, {
      onHandDetected: (detected) => {
        setHandDetected(detected);
      },
      onLandmarksDetected: (payload) => {
        setLandmarksPayload(payload);
      },
      onGestureEvent: (event: GestureEvent) => {
        const nextState = tracker['detector']?.getState() || 'IDLE';
        setGestureState((prev) => (prev !== nextState ? nextState : prev));

        if (mainContainerRef.current) {
          const width = mainContainerRef.current.clientWidth || window.innerWidth;
          const height = mainContainerRef.current.clientHeight || window.innerHeight;

          interactionControllerRef.current.handleGesture(
            event,
            width,
            height,
            (newVp) => {
              setExternalViewport({ ...newVp });
            },
            (screenPoint) => {
              // Handle Node Tap Select under hand target point
              if (reactFlowInstanceRef.current && graphModel) {
                const flowPoint = reactFlowInstanceRef.current.screenToFlowPosition({
                  x: screenPoint.x,
                  y: screenPoint.y,
                });
                const nodes = reactFlowInstanceRef.current.getNodes();
                const clickedNode = nodes.find((n) => {
                  const w = n.measured?.width || 120;
                  const h = n.measured?.height || 50;
                  return (
                    flowPoint.x >= n.position.x &&
                    flowPoint.x <= n.position.x + w &&
                    flowPoint.y >= n.position.y &&
                    flowPoint.y <= n.position.y + h
                  );
                });
                if (clickedNode) {
                  const matchedNode = graphModel.getNode(clickedNode.id);
                  if (matchedNode) {
                    setSelectedNode(matchedNode);
                  }
                }
              }
            }
          );
        }
      },
      onError: (err) => {
        console.warn('Hand tracking unavailable:', err.message);
      },
    });
  }, [graphModel]);

  const handleCameraStatusChange = useCallback((status: CameraState, errMsg?: string) => {
    setCameraStatus(status);
    if (status === 'denied' || status === 'unavailable') {
      setCameraError(errMsg || 'Camera permission denied or camera device unavailable.');
    }
  }, []);

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
    stopCameraMode();
    setViewMode('normal');
    setGraphModel(null);
    setSelectedNode(null);
    setSearchQuery('');
    setError(null);
  };

  const handleReactFlowInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
    const vp = instance.getViewport();
    interactionControllerRef.current.setViewport(vp);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraMode();
    };
  }, [stopCameraMode]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Application Header */}
      <header
        style={{
          height: '56px',
          background: 'rgba(7, 9, 14, 0.92)',
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
          <span className="badge badge-ts" style={{ marginLeft: '0.25rem' }}>Phase 2</span>
        </div>

        {/* Center Mode Switcher Tabs */}
        {graphModel && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              onClick={() => handleToggleViewMode('normal')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.9rem',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'normal' ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : 'transparent',
                color: viewMode === 'normal' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}
            >
              <Monitor size={15} /> Normal Mode
            </button>

            <button
              onClick={() => handleToggleViewMode('camera')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.9rem',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'camera' ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : 'transparent',
                color: viewMode === 'camera' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}
            >
              <Camera size={15} /> Camera Mode
            </button>
          </div>
        )}

        {/* Hand Status Indicator (When in Camera Mode) */}
        {graphModel && isCameraMode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            {cameraStatus === 'active' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: handDetected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: handDetected ? '#34d399' : '#94a3b8',
                  border: handDetected ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
                  fontWeight: 600,
                }}
              >
                {gestureState === 'ZOOMING' ? (
                  <>
                    <Hand size={13} style={{ color: '#a855f7' }} /> Stretch Zooming
                  </>
                ) : gestureState === 'GRABBING' || gestureState === 'MOVING' ? (
                  <>
                    <Grab size={13} style={{ color: '#818cf8' }} /> Pinch Grabbing
                  </>
                ) : (
                  <>
                    <Hand size={13} /> {handDetected ? `${landmarksPayload?.handCount || 1} Hand(s) Active` : 'Looking for Hand'}
                  </>
                )}
              </span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            JavaScript & TypeScript Dependency Intelligence
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main ref={mainContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Progress Modal */}
        <ProgressModal progress={progress} />

        {/* Camera Failure Banner Alert */}
        {isCameraMode && cameraError && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 70,
              background: 'rgba(239, 68, 68, 0.9)',
              color: '#ffffff',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}
          >
            <AlertTriangle size={18} />
            <span>{cameraError}</span>
            <button
              onClick={() => handleToggleViewMode('normal')}
              style={{
                background: '#ffffff',
                color: '#ef4444',
                border: 'none',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                marginLeft: '0.5rem',
              }}
            >
              Back to Normal Mode
            </button>
          </div>
        )}

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
          /* Interactive Graph & Camera View */
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Live Camera View Layer (Rendered only in Camera Mode) */}
            {isCameraMode && (
              <CameraView
                onCameraStatusChange={handleCameraStatusChange}
                onVideoReady={handleVideoReady}
                landmarksPayload={landmarksPayload}
                gestureState={gestureState}
                activeZoomScale={externalViewport?.zoom || 1.0}
              />
            )}

            {/* Gesture Guide Modal */}
            {isCameraMode && showGestureGuide && cameraStatus === 'active' && (
              <GestureGuideModal onDismiss={() => setShowGestureGuide(false)} />
            )}

            {/* Top Toolbar */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
              graphModel={graphModel}
              onResetView={() => setSelectedNode(null)}
              onNewSearch={handleNewSearch}
            />

            {/* 2D / Spatial Graph Overlay Canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5 }}>
              <GraphCanvas
                graphModel={graphModel}
                selectedNodeId={selectedNode?.id}
                searchQuery={searchQuery}
                filterType={filterType}
                mode={viewMode}
                externalViewport={externalViewport}
                onSelectNode={setSelectedNode}
                onInitInstance={handleReactFlowInit}
              />
            </div>

            {/* Side Inspector Panel */}
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

