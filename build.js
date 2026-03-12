import * as esbuild from "esbuild";

const shared = {
  entryPoints: ["src/index.js"],
  bundle: true,
  sourcemap: true,
  minify: true,
  target: ["es2022"],
  platform: "browser",
  logLevel: "info",
};

await Promise.all([
  esbuild.build({
    ...shared,
    format: "esm",
    outfile: "dist/node-game-renderer.js",
  }),
  esbuild.build({
    ...shared,
    format: "iife",
    globalName: "NodeGameRenderer",
    outfile: "dist/node-game-renderer.iife.js",
  }),
]);
