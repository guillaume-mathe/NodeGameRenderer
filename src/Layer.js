import { Sprite } from "./Sprite.js";

/**
 * Ordered group of sprites and tile maps within a scene.
 */
export class Layer {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
    this.visible = true;
    this.alpha = 1;

    /** @type {Sprite[]} */
    this._sprites = [];

    /** @type {import('./TileMap.js').TileMap[]} */
    this._tileMaps = [];
  }

  /** @returns {Sprite[]} */
  get sprites() {
    return this._sprites;
  }

  /** @returns {import('./TileMap.js').TileMap[]} */
  get tileMaps() {
    return this._tileMaps;
  }

  /**
   * Create and add a sprite to this layer.
   * @param {import('./SpriteSheet.js').SpriteSheet} sheet
   * @param {object} [props]
   * @returns {Sprite}
   */
  addSprite(sheet, props) {
    const sprite = new Sprite(sheet, props);
    this._sprites.push(sprite);
    return sprite;
  }

  /**
   * Remove a sprite from this layer.
   * @param {Sprite} sprite
   * @returns {boolean}
   */
  removeSprite(sprite) {
    const idx = this._sprites.indexOf(sprite);
    if (idx === -1) return false;
    this._sprites.splice(idx, 1);
    return true;
  }

  /**
   * Add a tile map to this layer.
   * @param {import('./TileMap.js').TileMap} tileMap
   */
  addTileMap(tileMap) {
    this._tileMaps.push(tileMap);
  }

  /**
   * Remove a tile map from this layer.
   * @param {import('./TileMap.js').TileMap} tileMap
   * @returns {boolean}
   */
  removeTileMap(tileMap) {
    const idx = this._tileMaps.indexOf(tileMap);
    if (idx === -1) return false;
    this._tileMaps.splice(idx, 1);
    return true;
  }
}
