export interface Point2D {
  x: number;
  y: number;
}

export type GestureState = 'IDLE' | 'GRABBING' | 'MOVING' | 'ZOOMING' | 'SELECTING';

export type GestureEventType =
  | 'PINCH_START'
  | 'PINCH_MOVE'
  | 'PINCH_END'
  | 'HAND_MOVE'
  | 'ZOOM_START'
  | 'ZOOM_MOVE'
  | 'ZOOM_END'
  | 'TAP_SELECT';

export interface GestureEvent {
  type: GestureEventType;
  point: Point2D;
  delta: Point2D;
  pinchDistance: number;
  zoomScale?: number;
  zoomCenter?: Point2D;
  handsCount?: number;
  isPinching?: boolean;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface SingleHandData {
  landmarks: HandLandmark[];
  label: 'Left' | 'Right' | 'Hand';
  score: number;
  isPinching: boolean;
  pinchPoint: Point2D;
  pinchDistance: number;
}

export interface HandLandmarksPayload {
  hands: SingleHandData[];
  handCount: number;
}

export interface HandTrackerCallbacks {
  onHandDetected?: (detected: boolean) => void;
  onGestureEvent?: (event: GestureEvent) => void;
  onLandmarksDetected?: (data: HandLandmarksPayload) => void;
  onError?: (error: Error) => void;
}

