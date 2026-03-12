/**
 * Scene node referencing a SpriteSheet.
 * Holds spatial/visual properties and animation playback state.
 */
export class Sprite {
  /**
   * @param {import('./SpriteSheet.js').SpriteSheet} sheet
   * @param {object} [props]
   */
  constructor(sheet, props = {}) {
    this.sheet = sheet;

    // Spatial
    this.x = props.x ?? 0;
    this.y = props.y ?? 0;
    this.scaleX = props.scaleX ?? 1;
    this.scaleY = props.scaleY ?? 1;
    this.rotation = props.rotation ?? 0;
    this.anchorX = props.anchorX ?? 0.5;
    this.anchorY = props.anchorY ?? 0.5;

    // Visual
    this.visible = props.visible ?? true;
    this.alpha = props.alpha ?? 1;
    this.frame = props.frame ?? 0;

    // Animation state
    /** @type {string | null} */
    this._animName = null;
    /** @type {{ frames: number[], frameDurationMs: number, loop: boolean } | null} */
    this._anim = null;
    this._animIndex = 0;
    this._animElapsed = 0;
  }

  /** @returns {boolean} */
  get playing() {
    return this._anim !== null;
  }

  /**
   * Start playing a named animation. No-op if already playing the same animation.
   * @param {string} name
   */
  play(name) {
    if (this._animName === name) return;
    const anim = this.sheet.getAnimation(name);
    if (!anim) return;
    this._animName = name;
    this._anim = anim;
    this._animIndex = 0;
    this._animElapsed = 0;
    this.frame = anim.frames[0];
  }

  /** Stop animation, freezing on the current frame. */
  stop() {
    this._animName = null;
    this._anim = null;
    this._animIndex = 0;
    this._animElapsed = 0;
  }

  /**
   * Advance animation by dtMs. Called by the renderer during render().
   * @param {number} dtMs
   */
  _tick(dtMs) {
    if (!this._anim) return;
    this._animElapsed += dtMs;
    const { frames, frameDurationMs, loop } = this._anim;
    while (this._animElapsed >= frameDurationMs) {
      this._animElapsed -= frameDurationMs;
      this._animIndex++;
      if (this._animIndex >= frames.length) {
        if (loop) {
          this._animIndex = 0;
        } else {
          this._animIndex = frames.length - 1;
          this.frame = frames[this._animIndex];
          this._anim = null;
          this._animName = null;
          this._animElapsed = 0;
          break;
        }
      }
    }
    if (this._anim) {
      this.frame = this._anim.frames[this._animIndex];
    }
  }
}
