/**
 * Defines frame regions and animation definitions for a source image.
 * Supports grid-based (uniform frame size) and custom region modes.
 */
export class SpriteSheet {
  /**
   * @param {ImageBitmap | { width: number, height: number }} image
   * @param {{ frameWidth?: number, frameHeight?: number, regions?: Record<string, { x: number, y: number, w: number, h: number }> }} [options]
   */
  constructor(image, options = {}) {
    this.image = image;

    /** @type {{ x: number, y: number, w: number, h: number }[]} */
    this._frames = [];

    /** @type {Map<string, { frames: number[], frameDurationMs: number, loop: boolean }>} */
    this._animations = new Map();

    if (options.regions) {
      // Custom region mode — named regions mapped to indexed frames
      /** @type {Map<string, number>} */
      this._regionIndex = new Map();
      for (const [name, rect] of Object.entries(options.regions)) {
        this._regionIndex.set(name, this._frames.length);
        this._frames.push({ x: rect.x, y: rect.y, w: rect.w, h: rect.h });
      }
    } else if (options.frameWidth && options.frameHeight) {
      // Grid mode — compute frames from image dimensions
      this._frameWidth = options.frameWidth;
      this._frameHeight = options.frameHeight;
      const cols = Math.floor(image.width / options.frameWidth);
      const rows = Math.floor(image.height / options.frameHeight);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this._frames.push({
            x: c * options.frameWidth,
            y: r * options.frameHeight,
            w: options.frameWidth,
            h: options.frameHeight,
          });
        }
      }
    }
  }

  /** @returns {number} */
  get frameCount() {
    return this._frames.length;
  }

  /**
   * @param {number} index
   * @returns {{ x: number, y: number, w: number, h: number }}
   */
  getFrame(index) {
    return this._frames[index];
  }

  /**
   * @param {string} name
   * @param {{ frames: number[], frameDurationMs: number, loop?: boolean }} def
   */
  defineAnimation(name, def) {
    this._animations.set(name, {
      frames: def.frames,
      frameDurationMs: def.frameDurationMs,
      loop: def.loop !== undefined ? def.loop : true,
    });
  }

  /**
   * @param {string} name
   * @returns {{ frames: number[], frameDurationMs: number, loop: boolean } | undefined}
   */
  getAnimation(name) {
    return this._animations.get(name);
  }
}
