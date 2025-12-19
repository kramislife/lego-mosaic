export const paintPixel = ({
  row,
  col,
  color,
  pixelModeOverride,
  gridDimensions,
  pixelGridRef,
  editedPixelsRef,
  usageMapRef,
  ensureUsageEntry,
  colorLookup,
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
  if (!Array.isArray(pixels) || !pixels[index]) {
    return false;
  }

  const currentPixel = pixels[index];
  
  // If no color provided, use the existing pixel's color (for pixel mode-only changes)
  let colorToUse = color;
  if (!colorToUse && currentPixel) {
    // Try to get color from lookup if we have colorId
    if (currentPixel.colorId && colorLookup) {
      colorToUse = colorLookup.get(currentPixel.colorId);
    }
    // Fallback to pixel's own color data if lookup fails
    if (!colorToUse && currentPixel.hex) {
      colorToUse = {
        id: currentPixel.colorId,
        hex: currentPixel.hex,
        name: currentPixel.name || "",
        isCustom: Boolean(currentPixel.isCustom),
      };
    }
  }

  // If still no color, we can't proceed
  if (!colorToUse) {
    return false;
  }

  const previousColorId = currentPixel.colorId;
  const isColorChange = previousColorId !== colorToUse.id;

  pixels[index] = {
    ...currentPixel,
    colorId: colorToUse.id,
    hex: colorToUse.hex,
    isCustom: Boolean(colorToUse.isCustom),
    pixelModeOverride: pixelModeOverride ?? null,
  };

  // Record this pixel as manually edited so we can re-apply it
  // after any future automatic remapping (e.g. palette changes).
  editedPixelsRef.current.set(index, {
    colorId: colorToUse.id,
    hex: colorToUse.hex,
    isCustom: Boolean(colorToUse.isCustom),
    pixelModeOverride: pixelModeOverride ?? null,
  });

  // Only update usage counts if the color actually changed
  if (isColorChange) {
    if (previousColorId && usageMapRef.current.has(previousColorId)) {
      const prevEntry = usageMapRef.current.get(previousColorId);
      prevEntry.count = Math.max(0, (prevEntry.count || 0) - 1);
    }

    const nextEntry = ensureUsageEntry(colorToUse);
    if (nextEntry) {
      nextEntry.count = (nextEntry.count || 0) + 1;
    }
  }

  return true;
};


