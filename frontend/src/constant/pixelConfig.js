import { Brush, Pipette, Eraser } from "lucide-react";

export const PIXEL_MODES = {
  ROUND_TILE: "circle",
  SQUARE_TILE: "square",
  SQUARE_PLATE: "square_plate",
  ROUND_PLATE: "circle_plate",
  // Legacy aliases for backward compatibility
  SQUARE: "square",
  CIRCLE: "circle",
  CONCENTRIC_SQUARE: "square_plate",
  CONCENTRIC_CIRCLE: "circle_plate",
};

export const PIXEL_MODE_OPTIONS = [
  { value: "none", label: "Default" },
  { value: PIXEL_MODES.ROUND_TILE, label: "Round Tiles" },
  { value: PIXEL_MODES.SQUARE_TILE, label: "Square Tiles" },
  { value: PIXEL_MODES.SQUARE_PLATE, label: "Square Plates" },
  { value: PIXEL_MODES.ROUND_PLATE, label: "Round Plates" },
];

export const TOOL_OPTIONS = [
  { value: "paint", label: "Paint", icon: Brush },
  { value: "pick", label: "Dropper", icon: Pipette },
  { value: "erase", label: "Eraser", icon: Eraser },
];

export default PIXEL_MODES;