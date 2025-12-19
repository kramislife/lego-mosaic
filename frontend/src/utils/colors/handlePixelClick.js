import { pickPixelColor } from "@/utils/colors/tools/dropper";

export const handlePixelClickLogic = ({
  tool,
  row,
  col,
  activeColorId,
  colorLookup,
  editPixelColor,
  erasePixelEdit,
  gridDimensions,
  pixelGrid,
  availableColors,
  setActiveColorId,
  brushPixelMode,
}) => {
  if (!gridDimensions?.width || !gridDimensions?.height) return;

  if (tool === "paint") {
    // This enables changing pixel mode without selecting a color
    if (!activeColorId && (!brushPixelMode || brushPixelMode === "none")) {
      return;
    }

    const color = activeColorId ? colorLookup.get(activeColorId) : null;
    const pixelModeOverride =
      brushPixelMode && brushPixelMode !== "none" ? brushPixelMode : null;

    // If pixelModeOverride is set, we'll use the existing pixel's color
    editPixelColor({ row, col, color, pixelModeOverride, colorLookup });
    return;
  }

  if (tool === "pick") {
    const pickedId = pickPixelColor({
      row,
      col,
      gridDimensions,
      pixelGrid,
      availableColors,
    });
    if (!pickedId) return;
    setActiveColorId(pickedId);
    return;
  }

  if (tool === "erase") {
    erasePixelEdit({ row, col });
  }
};
