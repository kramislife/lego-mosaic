export const erasePixel = ({
  row,
  col,
  gridDimensions,
  pixelGridRef,
  basePixelGridRef,
  editedPixelsRef,
  usageMapRef,
  ensureUsageEntry,
}) => {
  if (
    typeof row !== "number" ||
    typeof col !== "number" ||
    !gridDimensions?.width ||
    !gridDimensions?.height
  ) {
    return false;
  }

  const width = gridDimensions.width;
  const height = gridDimensions.height;

  if (row < 0 || row >= height || col < 0 || col >= width) {
    return false;
  }

  const index = row * width + col;
  const pixels = pixelGridRef.current;
  const basePixels = basePixelGridRef.current;

  if (
    !Array.isArray(pixels) ||
    !pixels[index] ||
    !Array.isArray(basePixels) ||
    !basePixels[index]
  ) {
    return false;
  }

  // If there is no manual edit recorded for this pixel, do nothing.
  if (!editedPixelsRef.current.has(index)) {
    return false;
  }

  const currentColorId = pixels[index].colorId;
  const basePixel = basePixels[index];
  const baseColorId = basePixel.colorId;

  // Restore pixel to its full baseline (original color AND pixel mode)
  pixels[index] = {
    ...pixels[index],
    colorId: baseColorId,
    hex: basePixel.hex,
    isCustom: Boolean(basePixel.isCustom),
    pixelModeOverride: basePixel.pixelModeOverride ?? null,
  };

  // Remove manual edit entry
  editedPixelsRef.current.delete(index);

  // Update usage counts
  if (currentColorId && usageMapRef.current.has(currentColorId)) {
    const prevEntry = usageMapRef.current.get(currentColorId);
    prevEntry.count = Math.max(0, (prevEntry.count || 0) - 1);
  }

  if (baseColorId) {
    const baseEntry = ensureUsageEntry({
      id: baseColorId,
      name: basePixel.name,
      hex: basePixel.hex,
      isCustom: basePixel.isCustom,
    });
    if (baseEntry) {
      baseEntry.count = (baseEntry.count || 0) + 1;
    }
  }

  return true;
};

export const erasePixelsByColorId = ({
  colorId,
  gridDimensions,
  pixelGridRef,
  basePixelGridRef,
  editedPixelsRef,
  usageMapRef,
  ensureUsageEntry,
}) => {
  if (!colorId) return false;
  if (!gridDimensions?.width || !gridDimensions?.height) return false;

  const pixels = pixelGridRef.current;
  const basePixels = basePixelGridRef.current;
  if (!Array.isArray(pixels) || !Array.isArray(basePixels)) return false;

  let changed = false;

  editedPixelsRef.current.forEach((override, index) => {
    if (!override || override.colorId !== colorId) return;
    const basePixel = basePixels[index];
    const currentPixel = pixels[index];
    if (!basePixel || !currentPixel) return;

    const currentColorId = currentPixel.colorId;
    const baseColorId = basePixel.colorId;
    // Preserve the current pixel mode override (if any) - only revert the color
    const preservedPixelModeOverride = currentPixel.pixelModeOverride ?? null;

    // Restore pixel to its baseline mapped color, but preserve pixel mode override
    pixels[index] = {
      ...currentPixel,
      colorId: baseColorId,
      hex: basePixel.hex,
      isCustom: Boolean(basePixel.isCustom),
      pixelModeOverride: preservedPixelModeOverride,
    };

    // Update the edit entry to reflect color reversion but keep pixel mode
    // If there's still a pixel mode override, keep the entry; otherwise remove it
    if (preservedPixelModeOverride) {
      editedPixelsRef.current.set(index, {
        colorId: baseColorId,
        hex: basePixel.hex,
        isCustom: Boolean(basePixel.isCustom),
        pixelModeOverride: preservedPixelModeOverride,
      });
    } else {
      editedPixelsRef.current.delete(index);
    }

    // Update usage counts
    if (currentColorId && usageMapRef.current.has(currentColorId)) {
      const prevEntry = usageMapRef.current.get(currentColorId);
      prevEntry.count = Math.max(0, (prevEntry.count || 0) - 1);
    }

    if (baseColorId) {
      const baseEntry = ensureUsageEntry({
        id: baseColorId,
        name: basePixel.name,
        hex: basePixel.hex,
        isCustom: basePixel.isCustom,
      });
      if (baseEntry) {
        baseEntry.count = (baseEntry.count || 0) + 1;
      }
    }

    changed = true;
  });

  return changed;
};

