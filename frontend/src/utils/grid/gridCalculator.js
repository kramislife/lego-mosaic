export function getAllowedSizes(baseGrid, max = 128) {
  const sizes = [];
  for (let value = baseGrid; value <= max; value += baseGrid) sizes.push(value);
  return sizes;
}

export function getGridDimensions(width, height, baseGrid) {
  const cols = Math.max(1, Math.round(width / baseGrid));
  const rows = Math.max(1, Math.round(height / baseGrid));
  return { cols, rows };
}

export default { getAllowedSizes, getGridDimensions };
