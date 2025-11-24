import { blendWithBackground, rgbToLab } from "@/utils/colors/colorMatcher";

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Missing image source"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });

export const resizeImageToExactDimensions = (image, targetWidth, targetHeight) =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(image);
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const resized = new Image();
    resized.onload = () => resolve(resized);
    resized.onerror = () => resolve(image);
    resized.src = canvas.toDataURL();
  });

const createSamplingContext = (width, height, filter) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to obtain 2D context for sampling canvas");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (filter && filter !== "none") {
    ctx.filter = filter;
  }

  return { canvas, ctx };
};

export const samplePixels = (image, width, height, filter) => {
  const { canvas, ctx } = createSamplingContext(width, height, filter);
  ctx.drawImage(image, 0, 0, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);
  const pixels = new Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3] / 255;

      const blended = blendWithBackground({ r, g, b, a });
      const lab = rgbToLab(blended);

      pixels[y * width + x] = {
        x,
        y,
        lab,
      };
    }
  }

  return pixels;
};

export default {
  loadImage,
  resizeImageToExactDimensions,
  samplePixels,
};

