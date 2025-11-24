import { PIXEL_MODES } from "@/constant/pixelConfig";

export const normalisePixelMode = (mode) => {
  switch (mode) {
    case PIXEL_MODES.ROUND_PLATE:
    case PIXEL_MODES.CONCENTRIC_CIRCLE:
    case "circle_plate":
      return PIXEL_MODES.ROUND_PLATE;
    case PIXEL_MODES.SQUARE_PLATE:
    case PIXEL_MODES.CONCENTRIC_SQUARE:
    case "square_plate":
      return PIXEL_MODES.SQUARE_PLATE;
    case PIXEL_MODES.SQUARE_TILE:
    case PIXEL_MODES.SQUARE:
      return PIXEL_MODES.SQUARE_TILE;
    case PIXEL_MODES.ROUND_TILE:
    case PIXEL_MODES.CIRCLE:
    default:
      return PIXEL_MODES.ROUND_TILE;
  }
};

export default normalisePixelMode;

