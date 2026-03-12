# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Retained scene graph with a pluggable Canvas2D bitmap sprite renderer for `node-game-client`. Supports bitmap sprites with loop animations, sprite sheets, tiled game maps, and camera-relative rendering. Works on both `HTMLCanvasElement` and `OffscreenCanvas` (for Web Worker rendering via the existing WorkerBridge).

Part of a five-project game stack:
- **NodeGameServer** (sibling) — authoritative game server with tick-based simulation
- **NodeGameClient** (sibling) — browser client library (connection, interpolation, input, prediction)
- **NodeGameInputManager** (sibling) — intent-based input abstraction (keyboard/gamepad → MOVE_X, MOVE_Y)
- **NodeGameECS** (sibling) — lightweight ECS for game logic
- **NodeGameRenderer** (this repo) — retained scene graph with Canvas2D renderer

No external runtime dependencies. Requires Node.js >= 22.

## Commands

### Run tests

```bash
npm test
```

Runs `vitest run` — all tests in `test/`.

### Build

```bash
npm run build
```

Produces ESM + IIFE bundles in `dist/` and TypeScript declarations via esbuild + tsc.

## Architecture

### Scene Graph

Retained scene graph: `Scene` → `Layer[]` → `Sprite[]` + `TileMap[]`. Game code updates properties; the renderer draws automatically.

### SpriteSheet (`src/SpriteSheet.js`)

Defines frame regions within a source image. Two modes:
- **Grid mode**: `{ frameWidth, frameHeight }` — auto-computes frames from image dimensions
- **Custom mode**: `{ regions: { name: { x, y, w, h } } }` — named regions mapped to indexed frames

Animation definitions stored here (asset data); playback state lives on each Sprite.

### Sprite (`src/Sprite.js`)

Scene node referencing a SpriteSheet. Spatial properties (x, y, scale, rotation, anchor), visual properties (visible, alpha, frame), and animation playback via `play(name)` / `stop()`.

Anchor: `(0,0)` = top-left, `(0.5,0.5)` = center (default), `(1,1)` = bottom-right.

### TileMap (`src/TileMap.js`)

Grid of tile indices referencing a SpriteSheet as tile set. Named layers backed by `Uint16Array`. Internal +1 encoding (0 = empty); public API uses 0-based frame indices.

### Camera (`src/Camera.js`)

Viewport transform: position, zoom, rotation. `follow()` with optional lerp. Coordinate conversion: `worldToScreen()` / `screenToWorld()`. `getVisibleBounds()` for tile culling.

### Layer (`src/Layer.js`)

Ordered group of sprites + tile maps within a scene.

### Scene (`src/Scene.js`)

Ordered collection of layers, drawn back-to-front.

### BitmapRenderer (`src/BitmapRenderer.js`)

Canvas2D implementation of the pluggable renderer contract: `render(scene, camera, timestamp?)`, `resize(width, height)`, `destroy()`. Handles camera transforms, sprite animation ticking, tile viewport culling.

### Pluggable Renderer Contract

Duck-typed (no base class). Any renderer must implement:
- `render(scene, camera, timestamp?)`
- `resize(width, height)`
- `destroy()`

### Utilities

- `loadImage(src)` — `fetch` + `createImageBitmap`, works in Web Workers
- `parseTiledMap(json, { tileSet })` — Tiled JSON → TileMap converter

## Conventions

- ES modules (`"type": "module"`)
- JSDoc for public API documentation
- camelCase for methods/variables, CONSTANT_CASE for module-level constants
- Private methods prefixed with `_`
- Tests use vitest with mock images (`{ width, height }`)
- BitmapRenderer is not unit-tested (requires browser canvas) — it stays thin and delegates to well-tested data structures
