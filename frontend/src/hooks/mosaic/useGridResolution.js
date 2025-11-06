import { useMemo, useState, useCallback } from "react";
import {
  getAllowedSizes,
  getGridDimensions,
} from "@/utils/grid/gridCalculator";
import { clampToAllowed as clampToAllowedUtil } from "@/utils/grid/gridSizeClamp";

export const useGridResolution = () => {
  const [baseGrid, setBaseGrid] = useState(16);
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(16);

  const min = baseGrid;
  const max = 128;
  const step = baseGrid;

  const { cols, rows } = getGridDimensions(width, height, baseGrid);

  const allowedSizes = useMemo(
    () => getAllowedSizes(baseGrid, max),
    [baseGrid, max]
  );

  const clampToAllowed = useCallback(
    (value) => clampToAllowedUtil(value, allowedSizes),
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

  return {
    baseGrid,
    setBaseGrid,
    width,
    setWidth,
    height,
    setHeight,
    min,
    max,
    step,
    cols,
    rows,
    clampToAllowed,
    onSelectBase,
  };
};

export default useGridResolution;
