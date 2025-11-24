const BASE_RENDER_DIMENSION = 2000;
const QUALITY_MULTIPLIER = 2.25;
const MIN_CELL_SIZE = 12;
const MAX_CELL_SIZE = 64;

export const determineCellSize = (width, height) => {
  const maxCells = Math.max(width, height);
  if (maxCells === 0) return MIN_CELL_SIZE;

  const deviceScale = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  let qualityMultiplier = QUALITY_MULTIPLIER;
  if (maxCells >= 320) {
    qualityMultiplier = 4.0;
  } else if (maxCells >= 256) {
    qualityMultiplier = 3.5;
  } else if (maxCells >= 192) {
    qualityMultiplier = 3.0;
  } else if (maxCells >= 128) {
    qualityMultiplier = 2.75;
  } else if (maxCells >= 64) {
    qualityMultiplier = 2.5;
  }

  const maxCanvas = BASE_RENDER_DIMENSION * qualityMultiplier * deviceScale;
  const ideal = Math.floor(maxCanvas / maxCells);

  return Math.min(MAX_CELL_SIZE, Math.max(MIN_CELL_SIZE, ideal || MIN_CELL_SIZE));
};

export default determineCellSize;

