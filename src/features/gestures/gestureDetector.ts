import { Point2D, GestureState, GestureEvent, SingleHandData } from './gestureTypes';

export class GestureDetector {
  private state: GestureState = 'IDLE';
  private prevPoint: Point2D | null = null;
  private smoothedPoint: Point2D | null = null;
  private readonly alpha = 0.35; // Smoothing factor (0 = max smooth, 1 = no smooth)

  // Zoom tracking state
  private initialTwoHandDist: number | null = null;
  private lastZoomCenter: Point2D | null = null;

  // Pinch Tap tracking state
  private pinchStartTime: number = 0;
  private pinchStartPoint: Point2D | null = null;

  private readonly PINCH_START_THRESHOLD = 0.08;
  private readonly PINCH_RELEASE_THRESHOLD = 0.12;

  public reset(): void {
    this.state = 'IDLE';
    this.prevPoint = null;
    this.smoothedPoint = null;
    this.initialTwoHandDist = null;
    this.lastZoomCenter = null;
    this.pinchStartTime = 0;
    this.pinchStartPoint = null;
  }

  public getState(): GestureState {
    return this.state;
  }

  public processMultiHandLandmarks(hands: SingleHandData[]): GestureEvent | null {
    if (!hands || hands.length === 0) {
      if (this.state !== 'IDLE') {
        const lastPt = this.smoothedPoint || { x: 0.5, y: 0.5 };
        const oldState = this.state;
        this.reset();
        if (oldState === 'ZOOMING') {
          return {
            type: 'ZOOM_END',
            point: lastPt,
            delta: { x: 0, y: 0 },
            pinchDistance: 1.0,
            zoomScale: 1.0,
          };
        }
        return {
          type: 'PINCH_END',
          point: lastPt,
          delta: { x: 0, y: 0 },
          pinchDistance: 1.0,
        };
      }
      this.reset();
      return null;
    }

    // -------------------------------------------------------------
    // 1. DUAL HAND INTERACTION (Stretch Zoom In / Zoom Out)
    // -------------------------------------------------------------
    if (hands.length >= 2) {
      const handA = hands[0];
      const handB = hands[1];

      // STRICT OPEN HAND RULE:
      // If BOTH hands are OPEN (unbent/not pinching), DO NOT ZOOM! Keep state IDLE!
      const areHandsBent = handA.isPinching || handB.isPinching || handA.pinchDistance < 0.11 || handB.pinchDistance < 0.11;

      if (areHandsBent) {
        const ptA = handA.pinchPoint;
        const ptB = handB.pinchPoint;

        const dx = ptB.x - ptA.x;
        const dy = ptB.y - ptA.y;
        const currentDist = Math.sqrt(dx * dx + dy * dy);

        const zoomCenter: Point2D = {
          x: (ptA.x + ptB.x) / 2,
          y: (ptA.y + ptB.y) / 2,
        };

        if (this.state !== 'ZOOMING' || !this.initialTwoHandDist) {
          this.state = 'ZOOMING';
          this.initialTwoHandDist = currentDist;
          this.lastZoomCenter = zoomCenter;
          return {
            type: 'ZOOM_START',
            point: zoomCenter,
            delta: { x: 0, y: 0 },
            pinchDistance: currentDist,
            zoomScale: 1.0,
            zoomCenter,
            handsCount: 2,
          };
        }

        const ratio = this.initialTwoHandDist > 0.01 ? currentDist / this.initialTwoHandDist : 1.0;
        this.initialTwoHandDist = currentDist;

        const deltaCenter: Point2D = this.lastZoomCenter
          ? { x: zoomCenter.x - this.lastZoomCenter.x, y: zoomCenter.y - this.lastZoomCenter.y }
          : { x: 0, y: 0 };
        this.lastZoomCenter = zoomCenter;

        return {
          type: 'ZOOM_MOVE',
          point: zoomCenter,
          delta: deltaCenter,
          pinchDistance: currentDist,
          zoomScale: ratio,
          zoomCenter,
          handsCount: 2,
        };
      }
    }

    // End 2-hand zoom if dropped back to 1 hand
    if (this.state === 'ZOOMING') {
      this.initialTwoHandDist = null;
      this.state = 'IDLE';
      return {
        type: 'ZOOM_END',
        point: hands[0].pinchPoint,
        delta: { x: 0, y: 0 },
        pinchDistance: hands[0].pinchDistance,
        zoomScale: 1.0,
        handsCount: 1,
      };
    }

    // -------------------------------------------------------------
    // 2. SINGLE HAND INTERACTION (Pan, Zoom fallback, Tap Select)
    // -------------------------------------------------------------
    const activeHand = hands[0];
    const rawPoint = activeHand.pinchPoint;

    // Exponential smoothing
    if (!this.smoothedPoint) {
      this.smoothedPoint = { ...rawPoint };
    } else {
      this.smoothedPoint = {
        x: this.smoothedPoint.x + this.alpha * (rawPoint.x - this.smoothedPoint.x),
        y: this.smoothedPoint.y + this.alpha * (rawPoint.y - this.smoothedPoint.y),
      };
    }

    const delta: Point2D = this.prevPoint
      ? {
          x: this.smoothedPoint.x - this.prevPoint.x,
          y: this.smoothedPoint.y - this.prevPoint.y,
        }
      : { x: 0, y: 0 };

    this.prevPoint = { ...this.smoothedPoint };

    // Check if middle finger is also pinched/extended for 1-hand zoom gesture
    const lm = activeHand.landmarks;
    const thumbTip = lm[4];
    const middleTip = lm[12];
    const distMiddle = Math.sqrt(
      Math.pow(middleTip.x - thumbTip.x, 2) + Math.pow(middleTip.y - thumbTip.y, 2)
    );

    const isPinching =
      this.state === 'IDLE'
        ? activeHand.pinchDistance < this.PINCH_START_THRESHOLD
        : activeHand.pinchDistance < this.PINCH_RELEASE_THRESHOLD;

    // Single-Hand 3-Finger Zoom mode (Index + Middle pinched to thumb)
    const isSingleHandZooming = activeHand.pinchDistance < 0.09 && distMiddle < 0.09;

    if (isSingleHandZooming) {
      const zoomStep = 1 - delta.y * 3.0; // Moving up zooms in, down zooms out
      this.state = 'ZOOMING';
      return {
        type: 'ZOOM_MOVE',
        point: this.smoothedPoint,
        delta,
        pinchDistance: activeHand.pinchDistance,
        zoomScale: Math.max(0.7, Math.min(1.3, zoomStep)),
        zoomCenter: this.smoothedPoint,
        handsCount: 1,
      };
    }

    if (isPinching) {
      if (this.state === 'IDLE') {
        this.state = 'GRABBING';
        this.pinchStartTime = Date.now();
        this.pinchStartPoint = { ...this.smoothedPoint };
        return {
          type: 'PINCH_START',
          point: this.smoothedPoint,
          delta,
          pinchDistance: activeHand.pinchDistance,
          isPinching: true,
        };
      } else {
        this.state = 'MOVING';
        return {
          type: 'PINCH_MOVE',
          point: this.smoothedPoint,
          delta,
          pinchDistance: activeHand.pinchDistance,
          isPinching: true,
        };
      }
    } else {
      if (this.state === 'GRABBING' || this.state === 'MOVING') {
        this.state = 'IDLE';
        const duration = Date.now() - this.pinchStartTime;
        const totalDist = this.pinchStartPoint
          ? Math.sqrt(
              Math.pow(this.smoothedPoint.x - this.pinchStartPoint.x, 2) +
                Math.pow(this.smoothedPoint.y - this.pinchStartPoint.y, 2)
            )
          : 1.0;

        // If quick pinch-and-release with minimal movement, treat as TAP_SELECT
        if (duration < 350 && totalDist < 0.04) {
          return {
            type: 'TAP_SELECT',
            point: this.smoothedPoint,
            delta: { x: 0, y: 0 },
            pinchDistance: activeHand.pinchDistance,
          };
        }

        return {
          type: 'PINCH_END',
          point: this.smoothedPoint,
          delta,
          pinchDistance: activeHand.pinchDistance,
        };
      }

      this.state = 'IDLE';
      return {
        type: 'HAND_MOVE',
        point: this.smoothedPoint,
        delta,
        pinchDistance: activeHand.pinchDistance,
        isPinching: false,
      };
    }
  }

  // Backward compatibility alias
  public processLandmarks(landmarks: any[]): GestureEvent | null {
    if (!landmarks || landmarks.length === 0) {
      return this.processMultiHandLandmarks([]);
    }
    const singleHand: SingleHandData = {
      landmarks,
      label: 'Hand',
      score: 1.0,
      isPinching: false,
      pinchPoint: { x: (landmarks[4]?.x + landmarks[8]?.x) / 2 || 0, y: (landmarks[4]?.y + landmarks[8]?.y) / 2 || 0 },
      pinchDistance: 0.1,
    };
    return this.processMultiHandLandmarks([singleHand]);
  }
}

