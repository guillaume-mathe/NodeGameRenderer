import { describe, it, expect } from "vitest";
import { Camera } from "../src/Camera.js";

describe("Camera", () => {
  describe("follow", () => {
    it("snaps to target without lerp", () => {
      const cam = new Camera(800, 600);
      cam.follow(100, 200);
      expect(cam.x).toBe(100);
      expect(cam.y).toBe(200);
    });

    it("snaps with lerp=1", () => {
      const cam = new Camera(800, 600);
      cam.follow(100, 200, 1);
      expect(cam.x).toBe(100);
      expect(cam.y).toBe(200);
    });

    it("interpolates with lerp < 1", () => {
      const cam = new Camera(800, 600);
      cam.follow(100, 200, 0.5);
      expect(cam.x).toBe(50);
      expect(cam.y).toBe(100);

      cam.follow(100, 200, 0.5);
      expect(cam.x).toBe(75);
      expect(cam.y).toBe(150);
    });
  });

  describe("worldToScreen / screenToWorld", () => {
    it("converts at default position and zoom", () => {
      const cam = new Camera(800, 600);
      // Camera at (0,0), zoom=1
      const screen = cam.worldToScreen(0, 0);
      expect(screen.x).toBe(400); // center
      expect(screen.y).toBe(300);
    });

    it("accounts for camera position", () => {
      const cam = new Camera(800, 600);
      cam.x = 100;
      cam.y = 50;
      const screen = cam.worldToScreen(100, 50);
      expect(screen.x).toBe(400); // should be centered
      expect(screen.y).toBe(300);
    });

    it("accounts for zoom", () => {
      const cam = new Camera(800, 600);
      cam.zoom = 2;
      const screen = cam.worldToScreen(10, 10);
      expect(screen.x).toBe(400 + 10 * 2);
      expect(screen.y).toBe(300 + 10 * 2);
    });

    it("screenToWorld inverts worldToScreen", () => {
      const cam = new Camera(800, 600);
      cam.x = 50;
      cam.y = -30;
      cam.zoom = 1.5;

      const world = { x: 123, y: -45 };
      const screen = cam.worldToScreen(world.x, world.y);
      const back = cam.screenToWorld(screen.x, screen.y);
      expect(back.x).toBeCloseTo(world.x, 10);
      expect(back.y).toBeCloseTo(world.y, 10);
    });
  });

  describe("getVisibleBounds", () => {
    it("returns bounds centered on camera at zoom=1", () => {
      const cam = new Camera(800, 600);
      cam.x = 0;
      cam.y = 0;
      const b = cam.getVisibleBounds();
      expect(b.left).toBe(-400);
      expect(b.right).toBe(400);
      expect(b.top).toBe(-300);
      expect(b.bottom).toBe(300);
    });

    it("adjusts bounds with camera offset", () => {
      const cam = new Camera(800, 600);
      cam.x = 100;
      cam.y = 100;
      const b = cam.getVisibleBounds();
      expect(b.left).toBe(-300);
      expect(b.right).toBe(500);
      expect(b.top).toBe(-200);
      expect(b.bottom).toBe(400);
    });

    it("shrinks visible area when zoomed in", () => {
      const cam = new Camera(800, 600);
      cam.zoom = 2;
      const b = cam.getVisibleBounds();
      expect(b.left).toBe(-200);
      expect(b.right).toBe(200);
      expect(b.top).toBe(-150);
      expect(b.bottom).toBe(150);
    });

    it("expands visible area when zoomed out", () => {
      const cam = new Camera(800, 600);
      cam.zoom = 0.5;
      const b = cam.getVisibleBounds();
      expect(b.left).toBe(-800);
      expect(b.right).toBe(800);
      expect(b.top).toBe(-600);
      expect(b.bottom).toBe(600);
    });
  });
});
