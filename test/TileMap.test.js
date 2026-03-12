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
});
