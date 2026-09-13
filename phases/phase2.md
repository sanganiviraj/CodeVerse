# Phase 2 — Camera Mode + Hand Interaction

## Status

Completed

---

## 1. Phase Goal

The primary goal of Phase 2 is to transform the CodeVerse dependency visualizer into a spatial overlay on top of the developer's live webcam feed. This makes the software architecture graph feel like a lightweight physical object floating in space that can be grabbed, translated, and manipulated naturally using hand gestures.

> **Key Milestone**: "Make the CodeVerse graph feel like a visual/spatial object that the developer can manipulate using their hand."

---

## 2. What Was Implemented

- **Mode Switcher Interface**: Seamless header toggle between `Normal Mode` (Phase 1 2D dark view) and `Camera Mode` (Phase 2 spatial background overlay).
- **Live Webcam Background Layer**: Requests browser camera permission via HTML5 `getUserMedia()`, streams live video in a mirrored layout, and stops tracks cleanly upon mode exit.
- **Left-Side Black Contrast Gradient Overlay**: A multi-stop CSS gradient (`linear-gradient(to right, rgba(7, 9, 14, 0.95)...)`) positioned over the left camera viewport to guarantee high-contrast legibility for point nodes regardless of camera background brightness.
- **Transparent Point-Style Graph Renderer**: Custom `PointNode` visualizer with glowing radial dots (`box-shadow: 0 0 12px #38bdf8`), clean minimal typography, and thin glowing connection lines over a fully transparent canvas.
- **Wasm-Based Hand Tracking Integration**: Powered by Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision` `HandLandmarker`), tracking 21 3D hand landmarks frame-by-frame locally.
- **Gesture State Machine & Detector**: Pinch gesture recognition evaluating normalized euclidean distance between Thumb Tip (Landmark 4) and Index Finger Tip (Landmark 8) with hysteresis thresholds (`0.08` start, `0.12` release).
- **Smooth Viewport Interaction Controller**: Translates pinch grab & hand movement deltas into graph viewport panning with exponential moving average (Lerp) smoothing to eliminate jitter.
- **Onboarding Gesture Guide Modal**: Subtle initial overlay explaining hand controls ("Move Hand", "Pinch Finger", "Pan & Release") with dismiss option.
- **Hand Tracking Status Indicator**: Live header badge reflecting real-time state (`Looking for Hand`, `Hand Active`, `Pinch Grabbing`).
- **Graceful Error Recovery & Fallbacks**: Non-blocking permission handling that falls back to mouse/trackpad controls if the camera is denied or unavailable.

---

## 3. User Experience

1. User opens CodeVerse and analyzes a repository (or selects a sample preset).
2. The graph renders in `Normal Mode`.
3. User clicks **Camera Mode** in the header.
4. Browser prompts for camera permissions.
5. Once allowed, the live webcam feed initializes in the background.
6. The graph transitions into a transparent point-style visualization floating on the left side over a subtle dark gradient.
7. User places their hand in front of the camera:
   - A green status badge `Hand Active` appears.
8. User brings thumb and index finger together (Pinch):
   - Status badge changes to purple `Pinch Grabbing`.
9. User moves their hand:
   - Graph translates smoothly following hand movement.
10. User opens pinch:
    - Graph stays locked in its new position.
11. Mouse/trackpad controls continue to work as a fallback.
12. User clicks **Normal Mode**:
    - Camera stream turns off immediately and normal 2D mode restores.

---

## 4. Architecture

```text
Camera Layer (getUserMedia)
       ↓
Video Frames (requestAnimationFrame)
       ↓
Hand Tracker (@mediapipe/tasks-vision)
       ↓
Hand Landmarks (21 3D Points)
       ↓
Gesture Detector (Thumb/Index Distance + State Machine)
       ↓
Normalized Gesture Events (PINCH_START, PINCH_MOVE, PINCH_END)
       ↓
Interaction Controller (Lerp & Offset Calculation)
       ↓
Graph Canvas Viewport (ReactFlow setViewport)
```

---

## 5. Project Structure

### `src/features/camera/CameraView.tsx`
- **Responsibility**: Manages HTML5 `<video>` element, camera stream initialization via `navigator.mediaDevices.getUserMedia()`, and renders the left-side contrast gradient overlay.
- **Why it exists**: Isolates DOM video element lifecycle and stream cleanup from graph rendering.
- **How it connects**: Mounts under `main` layer when `viewMode === 'camera'` and emits `onVideoReady` callback to trigger hand tracking.

### `src/features/camera/GestureGuideModal.tsx`
- **Responsibility**: Displays a lightweight onboarding card explaining hand interaction gestures.
- **Why it exists**: Guides first-time users on how to pinch, grab, and move the graph.
- **How it connects**: Renders floating at the bottom of the camera canvas until dismissed by the user.

### `src/features/gestures/gestureTypes.ts`
- **Responsibility**: Contains TypeScript definitions for `Point2D`, `GestureState`, `GestureEvent`, `HandLandmark`, and callbacks.
- **Why it exists**: Establishes a strict, type-safe contract between hand tracking, gesture detection, and interaction controller.

### `src/features/gestures/gestureDetector.ts`
- **Responsibility**: Processes 21 3D hand landmarks, calculates normalized distance between Landmark 4 (Thumb) and Landmark 8 (Index), applies exponential moving average (Lerp) smoothing, and manages state machine transitions.
- **Why it exists**: Decouples raw landmark noise from discrete interaction events (`PINCH_START`, `PINCH_MOVE`, `PINCH_END`).
- **How it connects**: Consumed per video frame by `HandTrackerService`.

### `src/features/gestures/handTracker.ts`
- **Responsibility**: Instantiates `@mediapipe/tasks-vision` `HandLandmarker` using Wasm, runs `requestAnimationFrame` detection loop, and passes landmarks to `GestureDetector`.
- **Why it exists**: Wraps MediaPipe WebAssembly SDK inside a clean service class with `start` and `stop` controls.
- **How it connects**: Instantiated by `App.tsx` when camera video stream is ready.

### `src/features/interaction/interactionController.ts`
- **Responsibility**: Translates normalized gesture event coordinates into screen pixel deltas and updates viewport transform (`x`, `y`, `zoom`).
- **Why it exists**: Maintains grab offset relative to initial pinch position so graph movement feels natural without coordinate jumping.
- **How it connects**: Updates `externalViewport` state passed into `GraphCanvas`.

### `src/features/graph/PointNode.tsx`
- **Responsibility**: Custom ReactFlow node component for Camera Mode.
- **Why it exists**: Replaces large rectangular file cards with sleek glowing dots and minimal file labels suited for transparent spatial overlays.
- **How it connects**: Registered in `GraphCanvas` `nodeTypes` map when `mode === 'camera'`.

---

## 6. Camera Implementation

- **API**: Uses browser native `navigator.mediaDevices.getUserMedia()`.
- **Configuration**: `video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }`.
- **Video Rendering**: Mirrored horizontally (`transform: scaleX(-1)`) to feel like a natural mirror.
- **Cleanup**: In `useEffect` return hook, calls `track.stop()` on all video tracks and clears `srcObject`.

---

## 7. Hand Tracking

- **Library**: `@mediapipe/tasks-vision` (`HandLandmarker`).
- **Why Selected**: Official Google MediaPipe WebAssembly SDK. Runs client-side with GPU acceleration, requires zero backend servers, and delivers low-latency 21 3D landmark tracking.
- **Landmark Extraction**: Tracks Landmark 4 (Thumb Tip) and Landmark 8 (Index Finger Tip).
- **Execution Frequency**: Runs inside `requestAnimationFrame` synchronized with browser display refresh rate.
- **Cleanup**: Calls `handLandmarker.close()` and cancels animation frames when Camera Mode exits.

---

## 8. Gesture Detection

- **Algorithm**: Evaluates 2D Euclidean distance between normalized Thumb Tip $(x_4, y_4)$ and Index Tip $(x_8, y_8)$:
  $$d = \sqrt{(x_8 - x_4)^2 + (y_8 - y_4)^2}$$
- **Thresholds**:
  - `PINCH_START`: $d < 0.08$
  - `PINCH_RELEASE`: $d \ge 0.12$ (Hysteresis prevents accidental state toggling near boundary)
- **Point Center**: Midpoint $((x_4 + x_8)/2, (y_4 + y_8)/2)$.

---

## 9. Gesture State Machine

```text
      ┌───────────────┐
      │     IDLE      │
      └───────┬───────┘
              │ pinch distance < 0.08
              ▼
      ┌───────────────┐
      │   GRABBING    │
      └───────┬───────┘
              │ hand movement
              ▼
      ┌───────────────┐
      │    MOVING     │
      └───────┬───────┘
              │ pinch distance >= 0.12
              ▼
      ┌───────────────┐
      │     IDLE      │
      └───────────────┘
```

---

## 10. Graph Movement

- **Coordinate Mapping**: Converts normalized hand coordinates $(x, y)$ to screen pixels $(x \cdot \text{width}, y \cdot \text{height})$.
- **Mirror Compensation**: Flips X coordinate $(1 - x)$ to align with mirrored camera preview.
- **Offset Preservation**: On `PINCH_START`, records initial hand position and graph viewport origin. On `PINCH_MOVE`, computes $\Delta X, \Delta Y$ and offsets viewport accordingly.
- **Smoothing**: Applies Lerp factor $\alpha = 0.35$ to smooth out tracking noise.

---

## 11. Rendering Architecture

Layer hierarchy in DOM:
1. `CameraView` Video Element (`zIndex: 0`)
2. Left-Side Gradient Overlay (`zIndex: 1`)
3. `GraphCanvas` Transparent ReactFlow Overlay (`zIndex: 5`)
4. Floating Toolbars & Header UI (`zIndex: 10 - 60`)

---

## 12. Performance

- **High-Frequency Coordinate Handling**: Raw per-frame landmark coordinates $(x, y)$ are processed inside service refs (`HandTrackerService`, `InteractionController`) without triggering React `setState` re-renders every 16ms.
- **React State Scoping**: React state is used exclusively for discrete UI states (`viewMode`, `cameraStatus`, `handDetected`, `gestureState`).
- **Resource Optimization**: Canvas background rendering is set to `transparent`, omitting grid/dot background processing in Camera Mode.

---

## 13. Privacy

- **100% Local Processing**: All camera video streams and MediaPipe Wasm execution occur strictly inside the user's browser memory.
- **Zero Server Uploads**: No video frames, camera images, or hand coordinates are ever transmitted to any remote server or external service.

---

## 14. Error Handling

- **Permission Denied**: If user denies camera access, a red alert banner appears offering a one-click return to Normal Mode.
- **Missing Camera Device**: If no webcam is available, displays a graceful error message without crashing the app.
- **Hand Tracking Drop**: If user's hand leaves the camera frame, state automatically resets to `IDLE` without leaving graph in locked state.

---

## 15. Testing

- **Type Safety**: Passed `npm run lint` (`tsc --noEmit`) with zero errors.
- **Production Build**: Built cleanly via `npm run build` (`vite build`) producing optimized bundles.
- **Manual Flow Verification**:
  1. Repository analysis in Normal Mode works.
  2. Toggle to Camera Mode activates webcam and left gradient.
  3. Graph switches to transparent point nodes.
  4. Hand pinch grabs and moves graph smoothly.
  5. Release pinch drops graph in place.
  6. Exit Camera Mode immediately turns off webcam light.

---

## 16. Known Limitations

- **Browser WebAssembly Support**: Requires modern browser supporting WebAssembly and WebGL for MediaPipe GPU acceleration.
- **Lighting Sensitivity**: Hand tracking accuracy depends on adequate room lighting and clear hand visibility.
- **2D Spatial Projection**: Phase 2 uses 2D spatial translation over camera view; true 3D spatial computing will be introduced in Phase 3.

---

## 17. How to Run

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run type check
npm run lint

# Build for production
npm run build
```

---

## 18. How to Demo

1. Open `http://localhost:5173`.
2. Click sample preset `Zustand` or enter a GitHub repository URL.
3. Observe standard 2D dependency graph in **Normal Mode**.
4. Click **Camera Mode** in the top header.
5. Allow camera access when prompted.
6. Observe live webcam background with left dark contrast gradient and glowing point nodes.
7. Raise your hand in front of the camera and pinch thumb + index finger together.
8. Drag your hand across the view to reposition the dependency graph.
9. Release your pinch to lock the graph in place.
10. Click **Normal Mode** to instantly turn off the camera.

---

## 19. What I Learned From Phase 2

- **Client-Side Wasm Vision**: Google MediaPipe WebAssembly SDK enables production-grade real-time computer vision directly in web browsers without backend latency or cloud APIs.
- **Decoupling Tracking from React State**: Keeping per-frame coordinate tracking in imperative refs while updating React state only for macro transitions is essential for maintaining 60 FPS performance.
- **Spatial UI UX**: Overlaying technical diagrams over real-world video requires dedicated contrast management (like gradient backdrops) and point-style node representations to feel spatial rather than cluttered.
