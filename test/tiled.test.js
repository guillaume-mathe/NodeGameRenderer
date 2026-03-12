import { describe, it, expect } from "vitest";
import { SpriteSheet } from "../src/SpriteSheet.js";
import { parseTiledMap } from "../src/loaders/tiled.js";

function makeSheet() {
  return new SpriteSheet(
    { width: 128, height: 128 },
    { frameWidth: 16, frameHeight: 16 },
  );
}

describe("parseTiledMap", () => {
  it("parses a minimal Tiled JSON", () => {
    const json = {
      width: 3,
      height: 2,
      tilewidth: 16,
      tileheight: 16,
      layers: [
        {
          name: "ground",
          type: "tilelayer",
          data: [1, 2, 3, 4, 5, 6],
        },
      ],
    };

    const tm = parseTiledMap(json, { tileSet: makeSheet() });
    expect(tm.columns).toBe(3);
    expect(tm.rows).toBe(2);
    expect(tm.tileWidth).toBe(16);
    expect(tm.tileHeight).toBe(16);

    // Tiled GID 1 → frame index 0
    expect(tm.getTile("ground", 0, 0)).toBe(0);
    // Tiled GID 3 → frame index 2
    expect(tm.getTile("ground", 2, 0)).toBe(2);
    // Tiled GID 6 → frame index 5
    expect(tm.getTile("ground", 2, 1)).toBe(5);
  });

  it("handles empty tiles (GID 0)", () => {
    const json = {
      width: 2,
      height: 1,
      tilewidth: 16,
      tileheight: 16,
      layers: [
        {
          name: "sparse",
          type: "tilelayer",
          data: [0, 3],
        },
      ],
    };

    const tm = parseTiledMap(json, { tileSet: makeSheet() });
    expect(tm.getTile("sparse", 0, 0)).toBe(-1);
    expect(tm.getTile("sparse", 1, 0)).toBe(2);
  });

  it("skips non-tile layers", () => {
    const json = {
      width: 2,
      height: 1,
      tilewidth: 16,
      tileheight: 16,
      layers: [
        {
          name: "objects",
          type: "objectgroup",
          objects: [],
        },
        {
          name: "ground",
          type: "tilelayer",
          data: [1, 2],
        },
      ],
    };

    const tm = parseTiledMap(json, { tileSet: makeSheet() });
    expect(tm.layerNames).toEqual(["ground"]);
  });

  it("respects layer visibility and opacity", () => {
    const json = {
      width: 1,
      height: 1,
      tilewidth: 16,
      tileheight: 16,
      layers: [
        {
          name: "hidden",
          type: "tilelayer",
          data: [1],
          visible: false,
          opacity: 0.5,
        },
      ],
    };

    const tm = parseTiledMap(json, { tileSet: makeSheet() });
    const layer = tm.getLayer("hidden");
    expect(layer.visible).toBe(false);
    expect(layer.alpha).toBe(0.5);
  });
});
