import { Layer } from "./Layer.js";

/**
 * Ordered collection of layers, drawn back-to-front.
 */
export class Scene {
  constructor() {
    /** @type {Layer[]} */
    this._layers = [];

    /** @type {Map<string, Layer>} */
    this._layerMap = new Map();
  }

  /** @returns {Layer[]} */
  get layers() {
    return this._layers;
  }

  /**
   * Create a new named layer and append it to the scene.
   * @param {string} name
   * @returns {Layer}
   */
  createLayer(name) {
    if (this._layerMap.has(name)) {
      throw new Error(`Layer "${name}" already exists`);
    }
    const layer = new Layer(name);
    this._layers.push(layer);
    this._layerMap.set(name, layer);
    return layer;
  }

  /**
   * Remove a layer by name or reference.
   * @param {string | Layer} nameOrLayer
   * @returns {boolean}
   */
  removeLayer(nameOrLayer) {
    const name =
      typeof nameOrLayer === "string" ? nameOrLayer : nameOrLayer.name;
    const layer = this._layerMap.get(name);
    if (!layer) return false;
    this._layerMap.delete(name);
    const idx = this._layers.indexOf(layer);
    if (idx !== -1) this._layers.splice(idx, 1);
    return true;
  }

  /**
   * @param {string} name
   * @returns {Layer | undefined}
   */
  getLayer(name) {
    return this._layerMap.get(name);
  }
}
