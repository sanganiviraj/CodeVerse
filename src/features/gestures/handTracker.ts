import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandTrackerCallbacks, HandLandmark, SingleHandData } from './gestureTypes';
import { GestureDetector } from './gestureDetector';

export class HandTrackerService {
  private handLandmarker: HandLandmarker | null = null;
  private animFrameId: number | null = null;
  private videoElement: HTMLVideoElement | null = null;
  public detector = new GestureDetector();
  private isRunning = false;
  private lastVideoTime = -1;

  public async initialize(
    video: HTMLVideoElement,
    callbacks: HandTrackerCallbacks
  ): Promise<void> {
    this.videoElement = video;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      this.isRunning = true;
      this.startDetectionLoop(callbacks);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize HandLandmarker');
      callbacks.onError?.(error);
    }
  }

  private startDetectionLoop(callbacks: HandTrackerCallbacks): void {
    const renderLoop = () => {
      if (!this.isRunning || !this.videoElement || !this.handLandmarker) {
        return;
      }

      if (
        this.videoElement.readyState >= 2 &&
        this.videoElement.currentTime !== this.lastVideoTime
      ) {
        this.lastVideoTime = this.videoElement.currentTime;
        const nowInMs = Date.now();

        try {
          const results = this.handLandmarker.detectForVideo(this.videoElement, nowInMs);

          if (results.landmarks && results.landmarks.length > 0) {
            callbacks.onHandDetected?.(true);

            const processedHands: SingleHandData[] = results.landmarks.map((lms, idx) => {
              const rawLandmarks: HandLandmark[] = lms.map((lm) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
              }));

              const thumbTip = rawLandmarks[4];
              const indexTip = rawLandmarks[8];
              const dx = indexTip.x - thumbTip.x;
              const dy = indexTip.y - thumbTip.y;
              const pinchDistance = Math.sqrt(dx * dx + dy * dy);

              const handednessObj = results.handedness?.[idx]?.[0];
              const label = (handednessObj?.categoryName as 'Left' | 'Right') || 'Hand';
              const score = handednessObj?.score || 0.9;

              return {
                landmarks: rawLandmarks,
                label,
                score,
                isPinching: pinchDistance < 0.09,
                pinchPoint: {
                  x: (thumbTip.x + indexTip.x) / 2,
                  y: (thumbTip.y + indexTip.y) / 2,
                },
                pinchDistance,
              };
            });

            callbacks.onLandmarksDetected?.({
              hands: processedHands,
              handCount: processedHands.length,
            });

            const gestureEvent = this.detector.processMultiHandLandmarks(processedHands);
            if (gestureEvent) {
              callbacks.onGestureEvent?.(gestureEvent);
            }
          } else {
            callbacks.onHandDetected?.(false);
            callbacks.onLandmarksDetected?.({
              hands: [],
              handCount: 0,
            });

            const gestureEvent = this.detector.processMultiHandLandmarks([]);
            if (gestureEvent) {
              callbacks.onGestureEvent?.(gestureEvent);
            }
          }
        } catch (err) {
          console.warn('Hand tracking frame detection error:', err);
        }
      }

      this.animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
    this.detector.reset();
    this.videoElement = null;
  }
}

