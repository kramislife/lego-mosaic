import { PIXEL_MODES } from "@/constant/pixelConfig";
import { normalisePixelMode } from "@/utils/pixels/normalisePixelMode";
import { drawRoundTile } from "@/utils/pixels/roundTiles";
import { drawSquareTile } from "@/utils/pixels/squareTiles";
import { drawRoundPlate } from "@/utils/pixels/roundPlates";
import { drawSquarePlate } from "@/utils/pixels/squarePlates";

const FALLBACK_BACKGROUND = "#111827";
const SQUARE_OUTLINE_COLOR = "rgba(0, 0, 0, 0.65)";
const TILE_BORDER_COLOR = "rgba(0, 0, 0, 0.7)";

export const renderMappedPixels = (mappedPixels, width, height, cellSize, mode) => {
  const canvas = document.createElement("canvas");
  canvas.width = width * cellSize;
  canvas.height = height * cellSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D context for mosaic canvas");
  }

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = FALLBACK_BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const normalisedMode = normalisePixelMode(mode);

  const radius = Math.max(1, cellSize / 2);
  const innerRadius = radius * 0.55;
  const outlineWidth = Math.max(0.5, Math.min(1.5, Math.floor(cellSize * 0.05)));
  const outlineOffset = outlineWidth / 2;
  const halfCellSize = cellSize / 2;
  const plateBorderWidth = Math.max(1, cellSize * 0.05);
  const hasSquareOutline = cellSize >= 2;

  for (let i = 0; i < mappedPixels.length; i += 1) {
    const pixel = mappedPixels[i];
    if (!pixel) continue;

    const px = pixel.x * cellSize;
    const py = pixel.y * cellSize;
    const cx = px + halfCellSize;
    const cy = py + halfCellSize;

    switch (normalisedMode) {
      case PIXEL_MODES.ROUND_TILE: {
        drawRoundTile({ ctx, cx, cy, radius, hex: pixel.hex });
        break;
      }
      case PIXEL_MODES.SQUARE_TILE: {
        drawSquareTile({
          ctx,
          px,
          py,
          cellSize,
          hex: pixel.hex,
          hasOutline: hasSquareOutline,
          outlineColor: SQUARE_OUTLINE_COLOR,
          outlineWidth,
          outlineOffset,
        });
        break;
      }
      case PIXEL_MODES.ROUND_PLATE: {
        drawRoundPlate({
          ctx,
          cx,
          cy,
          radius,
          innerRadius,
          hex: pixel.hex,
          borderColor: TILE_BORDER_COLOR,
          borderWidth: plateBorderWidth,
        });
        break;
      }
      case PIXEL_MODES.SQUARE_PLATE:
      default: {
        drawSquarePlate({
          ctx,
          px,
          py,
          cellSize,
          cx,
          cy,
          innerRadius,
          hex: pixel.hex,
          borderColor: TILE_BORDER_COLOR,
          borderWidth: plateBorderWidth,
          hasOutline: hasSquareOutline,
          outlineColor: SQUARE_OUTLINE_COLOR,
          outlineWidth,
          outlineOffset,
        });
        break;
      }
    }
  }

  const dataUrl = canvas.toDataURL("image/png");
  return {
    mosaicUrl: dataUrl,
    size: { width: canvas.width, height: canvas.height },
  };
};

export default renderMappedPixels;

