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

  // Restore pixel to its baseline mapped color
  pixels[index] = {
    ...pixels[index],
    colorId: baseColorId,
    hex: basePixel.hex,
    isCustom: Boolean(basePixel.isCustom),
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


