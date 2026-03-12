/**
 * Canvas2D bitmap sprite renderer.
 * Implements the pluggable renderer contract: render(), resize(), destroy().
 */
export class BitmapRenderer {
  /**
   * @param {HTMLCanvasElement | OffscreenCanvas} canvas
   */
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._lastTimestamp = -1;
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

    // Camera transform: translate to center, scale by zoom, rotate, translate by -camera position
    ctx.translate(w / 2, h / 2);
    ctx.scale(camera.zoom, camera.zoom);
    if (camera.rotation) ctx.rotate(-camera.rotation);
    ctx.translate(-camera.x, -camera.y);

    for (const layer of scene.layers) {
      if (!layer.visible) continue;

      const layerAlpha = layer.alpha;
      if (layerAlpha <= 0) continue;

      // Draw tile maps first (behind sprites)
      for (const tileMap of layer.tileMaps) {
        this._drawTileMap(ctx, tileMap, camera, layerAlpha);
      }

      // Tick and draw sprites
      for (const sprite of layer.sprites) {
        sprite._tick(dt);
        if (!sprite.visible) continue;
        this._drawSprite(ctx, sprite, layerAlpha);
      }
    }

    ctx.restore();
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
  }
}
