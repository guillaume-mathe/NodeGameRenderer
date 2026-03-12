import { describe, it, expect } from "vitest";
import { SpriteSheet } from "../src/SpriteSheet.js";

describe("SpriteSheet", () => {
  describe("grid mode", () => {
    it("computes frames from image dimensions", () => {
      const sheet = new SpriteSheet(
        { width: 128, height: 64 },
        { frameWidth: 32, frameHeight: 32 },
      );
      expect(sheet.frameCount).toBe(8); // 4 cols × 2 rows
    });

    it("returns correct frame rects", () => {
      const sheet = new SpriteSheet(
        { width: 64, height: 64 },
        { frameWidth: 32, frameHeight: 32 },
      );
      expect(sheet.getFrame(0)).toEqual({ x: 0, y: 0, w: 32, h: 32 });
      expect(sheet.getFrame(1)).toEqual({ x: 32, y: 0, w: 32, h: 32 });
      expect(sheet.getFrame(2)).toEqual({ x: 0, y: 32, w: 32, h: 32 });
      expect(sheet.getFrame(3)).toEqual({ x: 32, y: 32, w: 32, h: 32 });
    });

    it("floors partial frames", () => {
      const sheet = new SpriteSheet(
        { width: 100, height: 50 },
        { frameWidth: 32, frameHeight: 32 },
      );
      // 3 cols (100/32 = 3.125 → 3), 1 row (50/32 = 1.5625 → 1)
      expect(sheet.frameCount).toBe(3);
    });
  });

  describe("custom regions", () => {
    it("creates frames from named regions", () => {
      const sheet = new SpriteSheet(
        { width: 256, height: 256 },
        {
          regions: {
            head: { x: 0, y: 0, w: 32, h: 32 },
            body: { x: 32, y: 0, w: 32, h: 64 },
          },
        },
      );
      expect(sheet.frameCount).toBe(2);
      expect(sheet.getFrame(0)).toEqual({ x: 0, y: 0, w: 32, h: 32 });
      expect(sheet.getFrame(1)).toEqual({ x: 32, y: 0, w: 32, h: 64 });
    });
  });

  describe("animations", () => {
    it("defines and retrieves animations", () => {
      const sheet = new SpriteSheet(
        { width: 128, height: 32 },
        { frameWidth: 32, frameHeight: 32 },
      );
      sheet.defineAnimation("walk", {
        frames: [0, 1, 2, 3],
        frameDurationMs: 100,
        loop: true,
      });
      const anim = sheet.getAnimation("walk");
      expect(anim).toEqual({
        frames: [0, 1, 2, 3],
        frameDurationMs: 100,
        loop: true,
      });
    });

    it("defaults loop to true", () => {
      const sheet = new SpriteSheet(
        { width: 64, height: 32 },
        { frameWidth: 32, frameHeight: 32 },
      );
      sheet.defineAnimation("idle", {
        frames: [0, 1],
        frameDurationMs: 200,
      });
      expect(sheet.getAnimation("idle").loop).toBe(true);
    });

    it("returns undefined for unknown animation", () => {
      const sheet = new SpriteSheet(
        { width: 64, height: 32 },
        { frameWidth: 32, frameHeight: 32 },
      );
      expect(sheet.getAnimation("nope")).toBeUndefined();
    });
  });
});
