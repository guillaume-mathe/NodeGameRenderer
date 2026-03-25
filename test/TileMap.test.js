import { describe, it, expect } from "vitest";
import { SpriteSheet } from "../src/SpriteSheet.js";
import { TileMap } from "../src/TileMap.js";

function makeSheet() {
  return new SpriteSheet(
    { width: 128, height: 128 },
    { frameWidth: 16, frameHeight: 16 },
  );
}

describe("TileMap", () => {
  it("computes pixel dimensions", () => {
    const tm = new TileMap(makeSheet(), {
      tileWidth: 16,
      tileHeight: 16,
      columns: 10,
      rows: 8,
    });
    expect(tm.pixelWidth).toBe(160);
    expect(tm.pixelHeight).toBe(128);
  });

  describe("layer CRUD", () => {
    it("creates and retrieves layers", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      const ground = tm.createLayer("ground");
      expect(ground.name).toBe("ground");
      expect(ground.visible).toBe(true);
      expect(ground.alpha).toBe(1);
      expect(ground.data.length).toBe(16);
      expect(tm.getLayer("ground")).toBe(ground);
    });

    it("throws on duplicate layer", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      tm.createLayer("ground");
      expect(() => tm.createLayer("ground")).toThrow(
        'TileMap layer "ground" already exists',
      );
    });

    it("removes layers", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      tm.createLayer("a");
      tm.createLayer("b");
      expect(tm.removeLayer("a")).toBe(true);
      expect(tm.getLayer("a")).toBeUndefined();
      expect(tm.layerNames).toEqual(["b"]);
      expect(tm.removeLayer("nope")).toBe(false);
    });
  });

  describe("setTile / getTile", () => {
    it("round-trips tile values", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      tm.createLayer("ground");
      tm.setTile("ground", 2, 3, 5);
      expect(tm.getTile("ground", 2, 3)).toBe(5);
    });

    it("returns -1 for empty tiles", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      tm.createLayer("ground");
      expect(tm.getTile("ground", 0, 0)).toBe(-1);
    });

    it("handles tile index 0", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      tm.createLayer("ground");
      tm.setTile("ground", 0, 0, 0);
      expect(tm.getTile("ground", 0, 0)).toBe(0);
    });

    it("returns -1 for unknown layer", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      expect(tm.getTile("nope", 0, 0)).toBe(-1);
    });
  });

  describe("setTiles", () => {
    it("bulk-sets tiles from a flat array", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 3,
        rows: 2,
      });
      tm.createLayer("ground");
      tm.setTiles("ground", [0, 1, 2, 3, -1, 5]);
      expect(tm.getTile("ground", 0, 0)).toBe(0);
      expect(tm.getTile("ground", 1, 0)).toBe(1);
      expect(tm.getTile("ground", 2, 0)).toBe(2);
      expect(tm.getTile("ground", 0, 1)).toBe(3);
      expect(tm.getTile("ground", 1, 1)).toBe(-1);
      expect(tm.getTile("ground", 2, 1)).toBe(5);
    });

    it("treats short arrays as empty for remaining tiles", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 2,
        rows: 2,
      });
      tm.createLayer("ground");
      tm.setTiles("ground", [3]);
      expect(tm.getTile("ground", 0, 0)).toBe(3);
      expect(tm.getTile("ground", 1, 0)).toBe(-1);
      expect(tm.getTile("ground", 0, 1)).toBe(-1);
    });

    it("ignores unknown layer", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 2,
        rows: 2,
      });
      tm.setTiles("nope", [0, 1, 2, 3]); // should not throw
    });
  });

  describe("createLayer with data", () => {
    it("creates and populates a layer in one call", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 2,
        rows: 2,
      });
      const layer = tm.createLayer("ground", [0, 1, 2, 3]);
      expect(layer.name).toBe("ground");
      expect(tm.getTile("ground", 0, 0)).toBe(0);
      expect(tm.getTile("ground", 1, 0)).toBe(1);
      expect(tm.getTile("ground", 0, 1)).toBe(2);
      expect(tm.getTile("ground", 1, 1)).toBe(3);
    });
  });

  describe("fill", () => {
    it("fills entire layer with a single tile", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 3,
        rows: 3,
      });
      tm.createLayer("ground");
      tm.fill("ground", 7);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          expect(tm.getTile("ground", c, r)).toBe(7);
        }
      }
    });

    it("clears layer when filled with -1", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 2,
        rows: 2,
      });
      tm.createLayer("ground");
      tm.fill("ground", 5);
      tm.fill("ground", -1);
      expect(tm.getTile("ground", 0, 0)).toBe(-1);
      expect(tm.getTile("ground", 1, 1)).toBe(-1);
    });
  });

  describe("fillRegion", () => {
    it("fills a rectangular region", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 4,
        rows: 4,
      });
      tm.createLayer("walls");
      tm.fillRegion("walls", 1, 1, 2, 2, 3);
      // Inside region
      expect(tm.getTile("walls", 1, 1)).toBe(3);
      expect(tm.getTile("walls", 2, 1)).toBe(3);
      expect(tm.getTile("walls", 1, 2)).toBe(3);
      expect(tm.getTile("walls", 2, 2)).toBe(3);
      // Outside region
      expect(tm.getTile("walls", 0, 0)).toBe(-1);
      expect(tm.getTile("walls", 3, 3)).toBe(-1);
    });

    it("clamps to map bounds", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 3,
        rows: 3,
      });
      tm.createLayer("ground");
      tm.fillRegion("ground", 2, 2, 5, 5, 1); // extends past bounds
      expect(tm.getTile("ground", 2, 2)).toBe(1);
      // Only the in-bounds corner is set; no crash
    });
  });

  describe("clear", () => {
    it("resets all tiles to empty", () => {
      const tm = new TileMap(makeSheet(), {
        tileWidth: 16,
        tileHeight: 16,
        columns: 3,
        rows: 3,
      });
      tm.createLayer("ground");
      tm.fill("ground", 2);
      tm.clear("ground");
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          expect(tm.getTile("ground", c, r)).toBe(-1);
        }
      }
    });
  });
});
