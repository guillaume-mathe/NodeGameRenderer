/**
 * Canvas2D bitmap sprite renderer.
 * Implements the pluggable renderer contract: render(), resize(), destroy().
 */
export class BitmapRenderer {
  /**
   * @param {HTMLCanvasElement | OffscreenCanvas} canvas
   * @param {{ pixelPerfect?: boolean }} [options]
   */
  constructor(canvas, options = {}) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._lastTimestamp = -1;
    this.pixelPerfect = options.pixelPerfect || false;

    /** @type {WeakMap<import('./Layer.js').Layer, OffscreenCanvas>} */
    this._layerCaches = new WeakMap();
  }

  /**
   * Render the scene from the camera's viewpoint.
   * @param {import('./Scene.js').Scene} scene
   * @param {import('./Camera.js').Camera} camera
   * @param {number} [timestamp] — DOMHighResTimeStamp from rAF
   */
  render(scene, camera, timestamp) {
    const ctx = this._ctx;
    const dt =
      timestamp !== undefined && this._lastTimestamp >= 0
        ? timestamp - this._lastTimestamp
        : 0;
    if (timestamp !== undefined) this._lastTimestamp = timestamp;

    const w = this._canvas.width;
    const h = this._canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    if (this.pixelPerfect) {
      ctx.imageSmoothingEnabled = false;

      const baseScale = Math.min(
        w / camera.viewportWidth,
        h / camera.viewportHeight,
      );
      const intScale = Math.max(1, Math.floor(baseScale));
      const effectiveZoom = intScale * camera.zoom;

      const scaledW = camera.viewportWidth * intScale;
      const scaledH = camera.viewportHeight * intScale;
      const offsetX = Math.floor((w - scaledW) / 2);
      const offsetY = Math.floor((h - scaledH) / 2);

      // Clip to letterbox area
      ctx.beginPath();
      ctx.rect(offsetX, offsetY, scaledW, scaledH);
      ctx.clip();

      ctx.translate(offsetX + scaledW / 2, offsetY + scaledH / 2);
      ctx.scale(effectiveZoom, effectiveZoom);
    } else {
      ctx.translate(w / 2, h / 2);
      ctx.scale(camera.zoom, camera.zoom);
    }

    if (camera.rotation) ctx.rotate(-camera.rotation);
    ctx.translate(-camera.x, -camera.y);

    for (const layer of scene.layers) {
      if (!layer.visible) continue;

      const layerAlpha = layer.alpha;
      if (layerAlpha <= 0) continue;

      // Always tick sprites (animations advance even for cached layers)
      for (const sprite of layer.sprites) {
        sprite._tick(dt);
      }

      if (layer.cacheable) {
        this._drawCachedLayer(ctx, layer, camera, layerAlpha);
      } else {
        this._drawLayerContent(ctx, layer, camera, layerAlpha);
      }
    }

    ctx.restore();
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Layer.js').Layer} layer
   * @param {import('./Camera.js').Camera} camera
   * @param {number} layerAlpha
   */
  _drawLayerContent(ctx, layer, camera, layerAlpha) {
    for (const tileMap of layer.tileMaps) {
      this._drawTileMap(ctx, tileMap, camera, layerAlpha);
    }
    for (const sprite of layer.sprites) {
      if (!sprite.visible) continue;
      this._drawSprite(ctx, sprite, layerAlpha);
    }
  }

  /**
   * Draw a cacheable layer: tilemap content from cache, sprites live.
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Layer.js').Layer} layer
   * @param {import('./Camera.js').Camera} camera
   * @param {number} layerAlpha
   */
  _drawCachedLayer(ctx, layer, camera, layerAlpha) {
    if (layer._dirty || !this._layerCaches.has(layer)) {
      this._rebuildLayerCache(layer);
      layer._dirty = false;
    }

    const cache = this._layerCaches.get(layer);
    if (cache) {
      ctx.globalAlpha = layerAlpha;
      ctx.drawImage(cache, 0, 0);
      ctx.globalAlpha = 1;
    } else {
      // No cacheable tilemap content — draw tilemaps normally
      for (const tileMap of layer.tileMaps) {
        this._drawTileMap(ctx, tileMap, camera, layerAlpha);
      }
    }

    // Sprites always drawn live (they may animate or move)
    for (const sprite of layer.sprites) {
      if (!sprite.visible) continue;
      this._drawSprite(ctx, sprite, layerAlpha);
    }
  }

  /**
   * Render all tilemap content for a layer into an offscreen cache canvas.
   * @param {import('./Layer.js').Layer} layer
   */
  _rebuildLayerCache(layer) {
    let cacheW = 0;
    let cacheH = 0;
    for (const tm of layer.tileMaps) {
      cacheW = Math.max(cacheW, tm.pixelWidth);
      cacheH = Math.max(cacheH, tm.pixelHeight);
    }

    if (cacheW === 0 || cacheH === 0) {
      this._layerCaches.delete(layer);
      return;
    }

    const cache = new OffscreenCanvas(cacheW, cacheH);
    const cacheCtx = cache.getContext("2d");
    if (this.pixelPerfect) {
      cacheCtx.imageSmoothingEnabled = false;
    }

    for (const tileMap of layer.tileMaps) {
      this._drawTileMapFull(cacheCtx, tileMap);
    }

    this._layerCaches.set(layer, cache);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./Sprite.js').Sprite} sprite
   * @param {number} layerAlpha
   */
  _drawSprite(ctx, sprite, layerAlpha) {
    const frameDef = sprite.sheet.getFrame(sprite.frame);
    if (!frameDef) return;

    const alpha = sprite.alpha * layerAlpha;
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(sprite.x, sprite.y);
    if (sprite.rotation) ctx.rotate(sprite.rotation);
    ctx.scale(sprite.scaleX, sprite.scaleY);

    const ox = -frameDef.w * sprite.anchorX;
    const oy = -frameDef.h * sprite.anchorY;

    ctx.drawImage(
      sprite.sheet.image,
      frameDef.x,
      frameDef.y,
      frameDef.w,
      frameDef.h,
      ox,
      oy,
      frameDef.w,
      frameDef.h,
    );

    ctx.restore();
  }

  /**
   * Draw a tilemap with viewport culling (normal rendering path).
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./TileMap.js').TileMap} tileMap
   * @param {import('./Camera.js').Camera} camera
   * @param {number} layerAlpha
   */
  _drawTileMap(ctx, tileMap, camera, layerAlpha) {
    const bounds = camera.getVisibleBounds();
    const { tileWidth, tileHeight, columns, rows } = tileMap;

    // Compute visible tile range
    const colMin = Math.max(0, Math.floor(bounds.left / tileWidth));
    const colMax = Math.min(columns - 1, Math.floor(bounds.right / tileWidth));
    const rowMin = Math.max(0, Math.floor(bounds.top / tileHeight));
    const rowMax = Math.min(
      rows - 1,
      Math.floor(bounds.bottom / tileHeight),
    );

    for (const layerName of tileMap.layerNames) {
      const tileLayer = tileMap.getLayer(layerName);
      if (!tileLayer.visible) continue;

      const alpha = tileLayer.alpha * layerAlpha;
      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha;

      for (let r = rowMin; r <= rowMax; r++) {
        for (let c = colMin; c <= colMax; c++) {
          const val = tileLayer.data[r * columns + c];
          if (val === 0) continue; // empty tile

          const frameIdx = val - 1;
          const frameDef = tileMap.sheet.getFrame(frameIdx);
          if (!frameDef) continue;

          ctx.drawImage(
            tileMap.sheet.image,
            frameDef.x,
            frameDef.y,
            frameDef.w,
            frameDef.h,
            c * tileWidth,
            r * tileHeight,
            tileWidth,
            tileHeight,
          );
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Draw all tiles of a tilemap without viewport culling (for cache building).
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./TileMap.js').TileMap} tileMap
   */
  _drawTileMapFull(ctx, tileMap) {
    const { columns, rows, tileWidth, tileHeight } = tileMap;

    for (const layerName of tileMap.layerNames) {
      const tileLayer = tileMap.getLayer(layerName);
      if (!tileLayer.visible) continue;

      ctx.globalAlpha = tileLayer.alpha;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          const val = tileLayer.data[r * columns + c];
          if (val === 0) continue;

          const frameDef = tileMap.sheet.getFrame(val - 1);
          if (!frameDef) continue;

          ctx.drawImage(
            tileMap.sheet.image,
            frameDef.x,
            frameDef.y,
            frameDef.w,
            frameDef.h,
            c * tileWidth,
            r * tileHeight,
            tileWidth,
            tileHeight,
          );
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Resize the canvas.
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
  }

  /** Clean up resources. */
  destroy() {
    this._ctx = null;
    this._canvas = null;
    this._layerCaches = null;
  }
}
