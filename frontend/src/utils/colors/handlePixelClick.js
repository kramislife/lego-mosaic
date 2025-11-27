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
    if (!activeColorId) return;
    const color = colorLookup.get(activeColorId);
    if (!color) return;
    const pixelModeOverride =
      brushPixelMode && brushPixelMode !== "none" ? brushPixelMode : null;
    editPixelColor({ row, col, color, pixelModeOverride });
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


