/**
 * Viewport transform applied by the renderer to all draw calls.
 * Supports position, zoom, rotation, follow with lerp, and coordinate conversion.
 */
export class Camera {
  /**
   * @param {number} viewportWidth
   * @param {number} viewportHeight
   */
  constructor(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.rotation = 0;
  }

  /**
   * Move camera toward a target position.
   * @param {number} targetX
   * @param {number} targetY
   * @param {number} [lerp] — 0..1 interpolation factor. Omit or pass 1 for instant snap.
   */
  follow(targetX, targetY, lerp) {
    if (lerp === undefined || lerp >= 1) {
      this.x = targetX;
      this.y = targetY;
    } else {
      this.x += (targetX - this.x) * lerp;
      this.y += (targetY - this.y) * lerp;
    }
  }

  /**
   * Convert world coordinates to screen coordinates.
   * @param {number} wx
   * @param {number} wy
   * @returns {{ x: number, y: number }}
   */
  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom + this.viewportWidth / 2,
      y: (wy - this.y) * this.zoom + this.viewportHeight / 2,
    };
  }

  /**
   * Convert screen coordinates to world coordinates.
   * @param {number} sx
   * @param {number} sy
   * @returns {{ x: number, y: number }}
   */
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewportWidth / 2) / this.zoom + this.x,
      y: (sy - this.viewportHeight / 2) / this.zoom + this.y,
    };
  }

  /**
   * Get the visible bounds in world coordinates.
   * @returns {{ left: number, top: number, right: number, bottom: number }}
   */
  getVisibleBounds() {
    const halfW = this.viewportWidth / 2 / this.zoom;
    const halfH = this.viewportHeight / 2 / this.zoom;
    return {
      left: this.x - halfW,
      top: this.y - halfH,
      right: this.x + halfW,
      bottom: this.y + halfH,
    };
  }
}
