import { useMemo, useState, useCallback } from "react";
import { LEGO_COLORS } from "@/constant/colorConfig";

export const useMosaic = () => {
  const [baseGrid, setBaseGrid] = useState(16);

  const allowedSizes = useMemo(() => {
    const sizes = [];
    for (let value = baseGrid; value <= 128; value += baseGrid)
      sizes.push(value);
    return sizes;
  }, [baseGrid]);

  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(16);

  const clampToAllowed = useCallback(
    (value) => {
      let nearest = allowedSizes[0];
      let minDiff = Math.abs(value - nearest);
      for (const size of allowedSizes) {
        const diff = Math.abs(value - size);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = size;
        }
      }
      return nearest;
    },
    [allowedSizes]
  );

  const onSelectBase = useCallback(
    (size) => {
      setBaseGrid(size);
      setWidth((prev) => clampToAllowed(prev));
      setHeight((prev) => clampToAllowed(prev));
    },
    [clampToAllowed]
  );

  const min = baseGrid;
  const max = 128;
  const step = baseGrid;

  const cols = Math.max(1, Math.round(width / baseGrid));
  const rows = Math.max(1, Math.round(height / baseGrid));

  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const [pixelMode, setPixelMode] = useState("square");
  const [activeColorId, setActiveColorId] = useState(LEGO_COLORS[0].id);
  const [tool, setTool] = useState("paint"); // paint | pick | erase
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#FF0000");

  return {
    // dimensions & grid
    baseGrid,
    width,
    setWidth,
    height,
    setHeight,
    clampToAllowed,
    onSelectBase,
    min,
    max,
    step,
    cols,
    rows,

    // adjustments
    hue,
    setHue,
    saturation,
    setSaturation,
    brightness,
    setBrightness,
    contrast,
    setContrast,

    // pixel mode & colors
    pixelMode,
    setPixelMode,
    colors: LEGO_COLORS,
    activeColorId,
    setActiveColorId,
    tool,
    setTool,
    customName,
    setCustomName,
    customHex,
    setCustomHex,
  };
};

export default useMosaic;
