import { findNearestColor } from "@/utils/colors/colorMatcher";

const BATCH_SIZE = 1000;

export const mapPixelsToPalette = (pixels, paletteEntries) => {
  if (!paletteEntries.length) {
    return {
      mappedPixels: [],
      usage: [],
    };
  }

  const usageMap = new Map();
  for (const entry of paletteEntries) {
    usageMap.set(entry.id, 0);
  }

  const mappedPixels = new Array(pixels.length);

  return new Promise((resolve) => {
    let processed = 0;

    const processBatch = () => {
      const end = Math.min(processed + BATCH_SIZE, pixels.length);

      for (let i = processed; i < end; i += 1) {
        const pixel = pixels[i];
        const nearest = findNearestColor(pixel.lab, paletteEntries);
        if (!nearest) continue;

        usageMap.set(nearest.id, (usageMap.get(nearest.id) || 0) + 1);

        mappedPixels[i] = {
          x: pixel.x,
          y: pixel.y,
          colorId: nearest.id,
          hex: nearest.hex,
          isCustom: nearest.isCustom ?? false,
        };
      }

      processed = end;

      if (processed < pixels.length) {
        setTimeout(processBatch, 0);
      } else {
        const usage = paletteEntries.map((entry) => ({
          id: entry.id,
          name: entry.name,
          hex: entry.hex,
          isCustom: entry.isCustom ?? false,
          count: usageMap.get(entry.id) || 0,
        }));

        resolve({ mappedPixels, usage });
      }
    };

    processBatch();
  });
};

export default mapPixelsToPalette;

