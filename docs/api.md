# API Reference

## SpriteSheet

Defines frame regions and animation definitions for a source image.

### `new SpriteSheet(image, options?)`

- `image` — `ImageBitmap` or `{ width, height }` (for testing)
- `options.frameWidth`, `options.frameHeight` — grid mode: uniform frame size
- `options.regions` — custom mode: `Record<string, { x, y, w, h }>`

### Properties

- `frameCount` — number of frames
- `image` — source image reference

### Methods

- `getFrame(index)` → `{ x, y, w, h }` — source rect for frame
- `defineAnimation(name, { frames, frameDurationMs, loop? })` — register animation (loop defaults to true)
- `getAnimation(name)` → `{ frames, frameDurationMs, loop }` or `undefined`

---

## Sprite

Scene node referencing a SpriteSheet. Created via `layer.addSprite(sheet, props?)`.

### Properties

- `x`, `y` — position (default: 0)
- `scaleX`, `scaleY` — scale (default: 1)
- `rotation` — radians (default: 0)
- `anchorX`, `anchorY` — anchor point 0..1 (default: 0.5)
- `visible` — (default: true)
- `alpha` — opacity 0..1 (default: 1)
- `frame` — current frame index (default: 0)
- `playing` — true if animation is active (getter)

### Methods

- `play(name)` — start named animation (no-op if same already playing)
- `stop()` — freeze on current frame

---

## TileMap

Grid of tile indices referencing a SpriteSheet.

### `new TileMap(sheet, { tileWidth, tileHeight, columns, rows })`

### Properties

- `pixelWidth`, `pixelHeight` — computed from grid dimensions
- `layerNames` — ordered array of layer names

### Methods

- `createLayer(name)` → `{ name, data, visible, alpha }`
- `getLayer(name)` → layer or `undefined`
- `removeLayer(name)` → boolean
- `setTile(layerName, col, row, tileIndex)` — 0-based frame index
- `getTile(layerName, col, row)` → 0-based frame index or -1 (empty)

---

## Camera

Viewport transform.

### `new Camera(viewportWidth, viewportHeight)`

### Properties

- `x`, `y` — position (default: 0)
- `zoom` — (default: 1)
- `rotation` — radians (default: 0)
- `viewportWidth`, `viewportHeight`

### Methods

- `follow(targetX, targetY, lerp?)` — move toward target; omit lerp for snap
- `worldToScreen(wx, wy)` → `{ x, y }`
- `screenToWorld(sx, sy)` → `{ x, y }`
- `getVisibleBounds()` → `{ left, top, right, bottom }` in world coords

---

## Layer

Ordered group within a scene. Created via `scene.createLayer(name)`.

### Properties

- `name`, `visible`, `alpha`
- `sprites` — array of Sprite refs
- `tileMaps` — array of TileMap refs

### Methods

- `addSprite(sheet, props?)` → `Sprite`
- `removeSprite(sprite)` → boolean
- `addTileMap(tileMap)`
- `removeTileMap(tileMap)` → boolean

---

## Scene

Ordered collection of layers.

### Properties

- `layers` — array of Layer refs (back-to-front)

### Methods

- `createLayer(name)` → `Layer` (throws on duplicate)
- `removeLayer(nameOrLayer)` → boolean
- `getLayer(name)` → `Layer` or `undefined`

---

## BitmapRenderer

Canvas2D renderer implementing the pluggable renderer contract.

### `new BitmapRenderer(canvas)`

- `canvas` — `HTMLCanvasElement` or `OffscreenCanvas`

### Methods

- `render(scene, camera, timestamp?)` — clear, apply camera transform, draw all layers
- `resize(width, height)` — resize canvas
- `destroy()` — release references

---

## loadImage

### `loadImage(src)` → `Promise<ImageBitmap>`

Fetch + createImageBitmap. Works in main thread and Web Workers.

---

## parseTiledMap

### `parseTiledMap(json, { tileSet })` → `TileMap`

Convert Tiled JSON export to TileMap. Processes `tilelayer` layers, maps GIDs to 0-based frame indices.
