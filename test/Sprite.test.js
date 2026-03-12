import { describe, it, expect } from "vitest";
import { SpriteSheet } from "../src/SpriteSheet.js";
import { Sprite } from "../src/Sprite.js";

function makeSheet() {
  const sheet = new SpriteSheet(
    { width: 128, height: 32 },
    { frameWidth: 32, frameHeight: 32 },
  );
  sheet.defineAnimation("walk", {
    frames: [0, 1, 2, 3],
    frameDurationMs: 100,
    loop: true,
  });
  sheet.defineAnimation("die", {
    frames: [0, 1, 2],
    frameDurationMs: 100,
    loop: false,
  });
  return sheet;
}

describe("Sprite", () => {
  it("has correct defaults", () => {
    const s = new Sprite(makeSheet());
    expect(s.x).toBe(0);
    expect(s.y).toBe(0);
    expect(s.scaleX).toBe(1);
    expect(s.scaleY).toBe(1);
    expect(s.rotation).toBe(0);
    expect(s.anchorX).toBe(0.5);
    expect(s.anchorY).toBe(0.5);
    expect(s.visible).toBe(true);
    expect(s.alpha).toBe(1);
    expect(s.frame).toBe(0);
    expect(s.playing).toBe(false);
  });

  it("accepts initial props", () => {
    const s = new Sprite(makeSheet(), { x: 10, y: 20, alpha: 0.5, frame: 2 });
    expect(s.x).toBe(10);
    expect(s.y).toBe(20);
    expect(s.alpha).toBe(0.5);
    expect(s.frame).toBe(2);
  });

  describe("play/stop", () => {
    it("starts animation and sets frame", () => {
      const s = new Sprite(makeSheet());
      s.play("walk");
      expect(s.playing).toBe(true);
      expect(s.frame).toBe(0);
    });

    it("is no-op if already playing same animation", () => {
      const s = new Sprite(makeSheet());
      s.play("walk");
      s._tick(150); // advance to frame 1
      expect(s.frame).toBe(1);
      s.play("walk"); // no-op — should not reset
      expect(s.frame).toBe(1);
    });

    it("stop freezes current frame", () => {
      const s = new Sprite(makeSheet());
      s.play("walk");
      s._tick(150);
      expect(s.frame).toBe(1);
      s.stop();
      expect(s.playing).toBe(false);
      expect(s.frame).toBe(1); // frozen
    });
  });

  describe("_tick", () => {
    it("advances looping animation", () => {
      const s = new Sprite(makeSheet());
      s.play("walk"); // frames [0,1,2,3], 100ms each
      expect(s.frame).toBe(0);

      s._tick(100);
      expect(s.frame).toBe(1);

      s._tick(100);
      expect(s.frame).toBe(2);

      s._tick(100);
      expect(s.frame).toBe(3);

      // Should loop back to 0
      s._tick(100);
      expect(s.frame).toBe(0);
    });

    it("handles large dt spanning multiple frames", () => {
      const s = new Sprite(makeSheet());
      s.play("walk");
      s._tick(250); // 2.5 frames worth
      expect(s.frame).toBe(2);
    });

    it("clamps non-loop animation at last frame", () => {
      const s = new Sprite(makeSheet());
      s.play("die"); // frames [0,1,2], 100ms each, loop: false
      s._tick(300); // all 3 frames consumed
      expect(s.frame).toBe(2);
      expect(s.playing).toBe(false);
    });

    it("is no-op when not playing", () => {
      const s = new Sprite(makeSheet());
      s.frame = 2;
      s._tick(1000);
      expect(s.frame).toBe(2);
    });
  });
});
