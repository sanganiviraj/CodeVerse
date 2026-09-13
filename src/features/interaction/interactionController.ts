import { GestureEvent, Point2D } from '../gestures/gestureTypes';

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export class InteractionController {
  private isGrabbing = false;
  private isZooming = false;
  private startHandPoint: Point2D | null = null;
  private startViewport: ViewportTransform = { x: 0, y: 0, zoom: 1 };
  private currentViewport: ViewportTransform = { x: 0, y: 0, zoom: 1 };

  public setViewport(viewport: ViewportTransform): void {
    this.currentViewport = { ...viewport };
  }

  public getViewport(): ViewportTransform {
    return this.currentViewport;
  }

  public handleGesture(
    event: GestureEvent,
    containerWidth: number,
    containerHeight: number,
    onViewportChange: (vp: ViewportTransform) => void,
    onTapSelect?: (screenPoint: Point2D) => void
  ): void {
    const rawPoint = event.zoomCenter || event.point;
    const screenX = (1 - rawPoint.x) * containerWidth;
    const screenY = rawPoint.y * containerHeight;

    switch (event.type) {
      case 'PINCH_START': {
        this.isGrabbing = true;
        this.isZooming = false;
        this.startHandPoint = { x: screenX, y: screenY };
        this.startViewport = { ...this.currentViewport };
        break;
      }

      case 'PINCH_MOVE': {
        if (!this.isGrabbing || !this.startHandPoint) {
          this.isGrabbing = true;
          this.startHandPoint = { x: screenX, y: screenY };
          this.startViewport = { ...this.currentViewport };
          break;
        }

        const deltaX = screenX - this.startHandPoint.x;
        const deltaY = screenY - this.startHandPoint.y;

        const updatedViewport: ViewportTransform = {
          x: this.startViewport.x + deltaX,
          y: this.startViewport.y + deltaY,
          zoom: this.currentViewport.zoom,
        };

        this.currentViewport = updatedViewport;
        onViewportChange(updatedViewport);
        break;
      }

      case 'PINCH_END': {
        this.isGrabbing = false;
        this.startHandPoint = null;
        break;
      }

      case 'ZOOM_START': {
        this.isZooming = true;
        this.isGrabbing = false;
        this.startViewport = { ...this.currentViewport };
        break;
      }

      case 'ZOOM_MOVE': {
        const scaleStep = event.zoomScale || 1.0;
        if (Math.abs(scaleStep - 1.0) < 0.001) break;

        const oldZoom = this.currentViewport.zoom;
        const targetZoom = oldZoom * scaleStep;
        const newZoom = Math.min(2.5, Math.max(0.1, targetZoom));

        if (Math.abs(newZoom - oldZoom) < 0.001) break;

        // Focal zoom transformation centered around hand midpoint
        const focalX = screenX;
        const focalY = screenY;

        const newX = focalX - (focalX - this.currentViewport.x) * (newZoom / oldZoom);
        const newY = focalY - (focalY - this.currentViewport.y) * (newZoom / oldZoom);

        const updatedViewport: ViewportTransform = {
          x: newX,
          y: newY,
          zoom: newZoom,
        };

        this.currentViewport = updatedViewport;
        onViewportChange(updatedViewport);
        break;
      }

      case 'ZOOM_END': {
        this.isZooming = false;
        break;
      }

      case 'TAP_SELECT': {
        onTapSelect?.({ x: screenX, y: screenY });
        break;
      }

      case 'HAND_MOVE':
      default:
        break;
    }
  }
}

