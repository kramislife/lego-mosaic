export const pickPixelColor = ({
  row,
  col,
  gridDimensions,
  pixelGrid,
  availableColors,
}) => {
  if (
    !gridDimensions?.width ||
    !gridDimensions?.height ||
    !Array.isArray(pixelGrid)
  ) {
    return null;
  }

  const width = gridDimensions.width;
  const height = gridDimensions.height;

  if (row < 0 || row >= height || col < 0 || col >= width) {
    return null;
  }

  const index = row * width + col;
  const pixel = pixelGrid[index];
  if (!pixel || !pixel.colorId) return null;

  const id = pixel.colorId;
  const hasColor = Array.isArray(availableColors)
    ? availableColors.some((c) => c.id === id)
    : true;

  if (!hasColor) return null;
  return id;
};


