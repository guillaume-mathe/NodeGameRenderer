/**
 * Load an image as an ImageBitmap. Works in both main thread and Web Workers.
 * @param {string} src — URL or path to image
 * @returns {Promise<ImageBitmap>}
 */
export async function loadImage(src) {
  const res = await fetch(src);
  const blob = await res.blob();
  return createImageBitmap(blob);
}
