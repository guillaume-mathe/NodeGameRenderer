# NodeGameRenderer

Retained scene graph with pluggable Canvas2D bitmap sprite renderer for [node-game-client](https://github.com/user/node-game-client).

## Features

- **Retained scene graph** — Scene/Layer/Sprite tree; update properties, renderer draws automatically
- **Sprite sheets** — grid-based or custom region definitions with named animations
- **Tile maps** — multiple named layers, viewport culling, bulk fill/region operations, Tiled JSON loader
- **Camera** — position, zoom, follow with lerp, world↔screen coordinate conversion
- **Pixel-perfect scaling** — optional integer-scaled rendering with automatic letterboxing
- **Layer caching** — cacheable layers render tilemap content to an offscreen canvas for better performance
- **Context-agnostic** — works with both `HTMLCanvasElement` and `OffscreenCanvas` (Web Workers)
- **Zero runtime dependencies**

## Install

```bash
npm install node-game-renderer
```

## Quick Start

```js
import { BitmapRenderer, Scene, Camera, SpriteSheet, loadImage } from "node-game-renderer";

const heroImg = await loadImage("hero.png");
const heroSheet = new SpriteSheet(heroImg, { frameWidth: 32, frameHeight: 32 });
heroSheet.defineAnimation("walk", { frames: [0, 1, 2, 3], frameDurationMs: 100, loop: true });

const scene = new Scene();
const layer = scene.createLayer("entities");
const hero = layer.addSprite(heroSheet);
hero.play("walk");

const renderer = new BitmapRenderer(canvas, { pixelPerfect: true });
const camera = new Camera(canvas.width, canvas.height);

function render(state, alpha, timestamp) {
  hero.x = lerpedPlayer.x;
  hero.y = lerpedPlayer.y;
  camera.follow(hero.x, hero.y);
  renderer.render(scene, camera, timestamp);
}
```

## API

See [docs/api.md](docs/api.md) for the full API reference.

## Development

```bash
npm install
npm test          # run vitest
npm run build     # ESM + IIFE bundles + type declarations
```

## License

ISC
