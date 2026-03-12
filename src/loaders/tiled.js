import { TileMap } from "../TileMap.js";

/**
 * Parse a Tiled JSON export into a TileMap.
 * @param {object} json — Tiled JSON map data
 * @param {{ tileSet: import('../SpriteSheet.js').SpriteSheet }} options
 * @returns {TileMap}
 */
export function parseTiledMap(json, { tileSet }) {
  const tileMap = new TileMap(tileSet, {
    tileWidth: json.tilewidth,
    tileHeight: json.tileheight,
    columns: json.width,
    rows: json.height,
  });

  for (const layer of json.layers) {
    if (layer.type !== "tilelayer") continue;

    const tileLayer = tileMap.createLayer(layer.name);

    if (layer.visible === false) {
      tileLayer.visible = false;
    }

    if (layer.opacity !== undefined) {
      tileLayer.alpha = layer.opacity;
    }

    const data = layer.data;
    for (let i = 0; i < data.length; i++) {
      const gid = data[i];
      if (gid === 0) continue; // empty tile
      // Tiled GIDs are 1-based; store as our +1 encoding (gid maps directly)
      tileLayer.data[i] = gid;
    }
  }

  return tileMap;
}
