/**
 * Grid of tile indices referencing a SpriteSheet as tile set.
 * Supports multiple named layers, each backed by a Uint16Array.
 */
export class TileMap {
  /**
   * @param {import('./SpriteSheet.js').SpriteSheet} sheet
   * @param {{ tileWidth: number, tileHeight: number, columns: number, rows: number }} options
   */
  constructor(sheet, options) {
    this.sheet = sheet;
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
    this.columns = options.columns;
    this.rows = options.rows;

    /** @type {Map<string, { name: string, data: Uint16Array, visible: boolean, alpha: number }>} */
    this._layers = new Map();

    /** @type {string[]} */
    this._layerOrder = [];
  }

  /** @returns {number} */
  get pixelWidth() {
    return this.columns * this.tileWidth;
  }

  /** @returns {number} */
  get pixelHeight() {
    return this.rows * this.tileHeight;
  }

  /**
   * @param {string} name
   * @param {ArrayLike<number>} [data] — optional flat array of 0-based tile indices (-1 for empty)
   * @returns {{ name: string, data: Uint16Array, visible: boolean, alpha: number }}
   */
  createLayer(name, data) {
    if (this._layers.has(name)) {
      throw new Error(`TileMap layer "${name}" already exists`);
    }
    const layer = {
      name,
      data: new Uint16Array(this.columns * this.rows),
      visible: true,
      alpha: 1,
    };
    this._layers.set(name, layer);
    this._layerOrder.push(name);
    if (data) {
      this.setTiles(name, data);
    }
    return layer;
  }

  /**
   * @param {string} name
   * @returns {{ name: string, data: Uint16Array, visible: boolean, alpha: number } | undefined}
   */
  getLayer(name) {
    return this._layers.get(name);
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  removeLayer(name) {
    if (!this._layers.has(name)) return false;
    this._layers.delete(name);
    this._layerOrder = this._layerOrder.filter((n) => n !== name);
    return true;
  }

  /** @returns {string[]} */
  get layerNames() {
    return this._layerOrder;
  }

  /**
   * @param {string} layerName
   * @param {number} col
   * @param {number} row
   * @param {number} tileIndex — 0-based frame index
   */
  setTile(layerName, col, row, tileIndex) {
    const layer = this._layers.get(layerName);
    if (!layer) return;
    layer.data[row * this.columns + col] = tileIndex + 1;
  }

  /**
   * @param {string} layerName
   * @param {number} col
   * @param {number} row
   * @returns {number} 0-based frame index, or -1 if empty
   */
  getTile(layerName, col, row) {
    const layer = this._layers.get(layerName);
    if (!layer) return -1;
    const val = layer.data[row * this.columns + col];
    return val === 0 ? -1 : val - 1;
  }

  /**
   * Bulk-set all tiles in a layer from a flat array of 0-based frame indices.
   * Use -1 (or any negative value) for empty tiles.
   * @param {string} layerName
   * @param {ArrayLike<number>} data — row-major, length should equal columns × rows
   */
  setTiles(layerName, data) {
    const layer = this._layers.get(layerName);
    if (!layer) return;
    const len = this.columns * this.rows;
    for (let i = 0; i < len; i++) {
      const val = i < data.length ? data[i] : -1;
      layer.data[i] = val >= 0 ? val + 1 : 0;
    }
  }

  /**
   * Fill an entire layer with a single tile index.
   * @param {string} layerName
   * @param {number} tileIndex — 0-based frame index, or -1 to clear
   */
  fill(layerName, tileIndex) {
    const layer = this._layers.get(layerName);
    if (!layer) return;
    layer.data.fill(tileIndex >= 0 ? tileIndex + 1 : 0);
  }

  /**
   * Fill a rectangular region with a single tile index.
   * @param {string} layerName
   * @param {number} col — start column
   * @param {number} row — start row
   * @param {number} width — region width in tiles
   * @param {number} height — region height in tiles
   * @param {number} tileIndex — 0-based frame index, or -1 to clear
   */
  fillRegion(layerName, col, row, width, height, tileIndex) {
    const layer = this._layers.get(layerName);
    if (!layer) return;
    const encoded = tileIndex >= 0 ? tileIndex + 1 : 0;
    const endCol = Math.min(col + width, this.columns);
    const endRow = Math.min(row + height, this.rows);
    for (let r = row; r < endRow; r++) {
      for (let c = col; c < endCol; c++) {
        layer.data[r * this.columns + c] = encoded;
      }
    }
  }

  /**
   * Clear all tiles in a layer (set to empty).
   * @param {string} layerName
   */
  clear(layerName) {
    const layer = this._layers.get(layerName);
    if (!layer) return;
    layer.data.fill(0);
  }
}
