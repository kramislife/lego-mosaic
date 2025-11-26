export const paintPixel = ({
  row,
  col,
  color,
  gridDimensions,
  pixelGridRef,
  editedPixelsRef,
  usageMapRef,
  ensureUsageEntry,
}) => {
  if (
    typeof row !== "number" ||
    typeof col !== "number" ||
    !color ||
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

  const previousColorId = pixels[index].colorId;

  pixels[index] = {
    ...pixels[index],
    colorId: color.id,
    hex: color.hex,
    isCustom: Boolean(color.isCustom),
  };

  // Record this pixel as manually edited so we can re-apply it
  // after any future automatic remapping (e.g. palette changes).
  editedPixelsRef.current.set(index, {
    colorId: color.id,
    hex: color.hex,
    isCustom: Boolean(color.isCustom),
  });

  if (previousColorId && usageMapRef.current.has(previousColorId)) {
    const prevEntry = usageMapRef.current.get(previousColorId);
    prevEntry.count = Math.max(0, (prevEntry.count || 0) - 1);
  }

  const nextEntry = ensureUsageEntry(color);
  if (nextEntry) {
    nextEntry.count = (nextEntry.count || 0) + 1;
  }

  return true;
};


