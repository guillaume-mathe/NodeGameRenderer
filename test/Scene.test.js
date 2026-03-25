import { describe, it, expect } from "vitest";
import { Scene } from "../src/Scene.js";
import { SpriteSheet } from "../src/SpriteSheet.js";
import { TileMap } from "../src/TileMap.js";

function makeSheet() {
  return new SpriteSheet(
    { width: 128, height: 32 },
    { frameWidth: 32, frameHeight: 32 },
  );
}

describe("Scene", () => {
  it("creates layers in order", () => {
    const scene = new Scene();
    const bg = scene.createLayer("background");
    const fg = scene.createLayer("foreground");
    expect(scene.layers).toEqual([bg, fg]);
    expect(scene.layers[0].name).toBe("background");
    expect(scene.layers[1].name).toBe("foreground");
  });

  it("throws on duplicate layer name", () => {
    const scene = new Scene();
    scene.createLayer("bg");
    expect(() => scene.createLayer("bg")).toThrow('Layer "bg" already exists');
  });

  it("gets layer by name", () => {
    const scene = new Scene();
    const layer = scene.createLayer("entities");
    expect(scene.getLayer("entities")).toBe(layer);
    expect(scene.getLayer("nope")).toBeUndefined();
  });

  it("removes layer by name", () => {
    const scene = new Scene();
    scene.createLayer("a");
    scene.createLayer("b");
    expect(scene.removeLayer("a")).toBe(true);
    expect(scene.layers.length).toBe(1);
    expect(scene.getLayer("a")).toBeUndefined();
  });

  it("removes layer by reference", () => {
    const scene = new Scene();
    const layer = scene.createLayer("a");
    expect(scene.removeLayer(layer)).toBe(true);
    expect(scene.layers.length).toBe(0);
  });

  it("returns false when removing non-existent layer", () => {
    const scene = new Scene();
    expect(scene.removeLayer("nope")).toBe(false);
  });
});

describe("Layer", () => {
  it("adds and removes sprites", () => {
    const scene = new Scene();
    const layer = scene.createLayer("entities");
    const sheet = makeSheet();
    const sprite = layer.addSprite(sheet, { x: 10, y: 20 });
    expect(sprite.x).toBe(10);
    expect(layer.sprites.length).toBe(1);
    expect(layer.sprites[0]).toBe(sprite);

    expect(layer.removeSprite(sprite)).toBe(true);
    expect(layer.sprites.length).toBe(0);
    expect(layer.removeSprite(sprite)).toBe(false);
  });

  it("adds and removes tile maps", () => {
    const scene = new Scene();
    const layer = scene.createLayer("ground");
    const sheet = makeSheet();
    const tm = new TileMap(sheet, {
      tileWidth: 32,
      tileHeight: 32,
      columns: 10,
      rows: 10,
    });
    layer.addTileMap(tm);
    expect(layer.tileMaps.length).toBe(1);
    expect(layer.tileMaps[0]).toBe(tm);

    expect(layer.removeTileMap(tm)).toBe(true);
    expect(layer.tileMaps.length).toBe(0);
    expect(layer.removeTileMap(tm)).toBe(false);
  });

  it("has visible and alpha defaults", () => {
    const scene = new Scene();
    const layer = scene.createLayer("test");
    expect(layer.visible).toBe(true);
    expect(layer.alpha).toBe(1);
  });

  it("defaults cacheable to false and dirty to true", () => {
    const scene = new Scene();
    const layer = scene.createLayer("ground");
    expect(layer.cacheable).toBe(false);
    expect(layer.dirty).toBe(true);
  });

  it("invalidate sets dirty to true", () => {
    const scene = new Scene();
    const layer = scene.createLayer("ground");
    layer._dirty = false;
    expect(layer.dirty).toBe(false);
    layer.invalidate();
    expect(layer.dirty).toBe(true);
  });

  it("adding a tilemap sets dirty", () => {
    const scene = new Scene();
    const layer = scene.createLayer("ground");
    layer._dirty = false;
    const tm = new TileMap(makeSheet(), {
      tileWidth: 32,
      tileHeight: 32,
      columns: 4,
      rows: 4,
    });
    layer.addTileMap(tm);
    expect(layer.dirty).toBe(true);
  });

  it("removing a tilemap sets dirty", () => {
    const scene = new Scene();
    const layer = scene.createLayer("ground");
    const tm = new TileMap(makeSheet(), {
      tileWidth: 32,
      tileHeight: 32,
      columns: 4,
      rows: 4,
    });
    layer.addTileMap(tm);
    layer._dirty = false;
    layer.removeTileMap(tm);
    expect(layer.dirty).toBe(true);
  });
});
